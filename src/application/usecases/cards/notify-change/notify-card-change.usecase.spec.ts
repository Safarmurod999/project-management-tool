import {
  Board,
  BoardRepository,
  Card,
  Column,
  ColumnRepository,
  Status,
  StatusRepository,
} from 'src/domain';
import { BoardStatus, NotificationType } from 'src/infrastructure/common/enum';
import { Logger } from 'src/infrastructure/logger';
import { SendNotificationUsecase } from '../../notifications/send';
import { NotifyCardChangeUsecaseImpl } from './notify-card-change.usecase';

describe('NotifyCardChangeUsecaseImpl', () => {
  let send: jest.Mock;
  let findColumn: jest.Mock;
  let logError: jest.Mock;
  let usecase: NotifyCardChangeUsecaseImpl;

  const card = (overrides: { statusId?: string; assigneeId?: string | null }) =>
    new Card(
      'card-1',
      'col-1',
      'Login page',
      null,
      0,
      overrides.statusId ?? 'todo',
      overrides.assigneeId === undefined ? 'alice' : overrides.assigneeId,
      'manager',
    );

  const status = (id: string, name: string) =>
    new Status(id, 'p1', name, id, '#000000', 0, false, 1, new Date());

  const cardData = {
    cardId: 'card-1',
    columnId: 'col-1',
    boardId: 'b1',
    projectId: 'p1',
  };

  beforeEach(() => {
    send = jest.fn().mockResolvedValue(null);
    findColumn = jest.fn((id: string) =>
      Promise.resolve(new Column(id, 'b1', 'Doing', 0, 1, new Date())),
    );
    logError = jest.fn();
    usecase = new NotifyCardChangeUsecaseImpl(
      { findById: findColumn } as unknown as ColumnRepository,
      {
        findById: jest
          .fn()
          .mockResolvedValue(
            new Board('b1', 'p1', 'B', null, BoardStatus.ACTIVE, 1, new Date()),
          ),
      } as unknown as BoardRepository,
      {
        findByIds: jest
          .fn()
          .mockResolvedValue([
            status('todo', 'To Do'),
            status('doing', 'In Progress'),
          ]),
      } as unknown as StatusRepository,
      { execute: send } as unknown as SendNotificationUsecase,
      { error: logError } as unknown as Logger,
    );
  });

  it('notifies the assignee of a new card', async () => {
    await usecase.execute({
      before: null,
      after: card({}),
      actorId: 'manager',
    });

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      recipientId: 'alice',
      actorId: 'manager',
      type: NotificationType.CARD_ASSIGNED,
      title: 'New card assigned',
      message: 'You were assigned to "Login page".',
      data: cardData,
    });
  });

  it('notifies the new assignee when a card is reassigned', async () => {
    await usecase.execute({
      before: card({ assigneeId: 'bob' }),
      after: card({ assigneeId: 'alice' }),
      actorId: 'manager',
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: 'alice',
        type: NotificationType.CARD_ASSIGNED,
      }),
    );
  });

  it('notifies the assignee when the status changes', async () => {
    await usecase.execute({
      before: card({ statusId: 'todo' }),
      after: card({ statusId: 'doing' }),
      actorId: 'manager',
    });

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      recipientId: 'alice',
      actorId: 'manager',
      type: NotificationType.CARD_STATUS_CHANGED,
      title: 'Card status changed',
      message: '"Login page" moved from To Do to In Progress.',
      data: { ...cardData, fromStatusId: 'todo', toStatusId: 'doing' },
    });
  });

  it('sends only card_assigned when one change reassigns and moves the card', async () => {
    await usecase.execute({
      before: card({ statusId: 'todo', assigneeId: 'bob' }),
      after: card({ statusId: 'doing', assigneeId: 'alice' }),
      actorId: 'manager',
    });

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ type: NotificationType.CARD_ASSIGNED }),
    );
  });

  it.each([
    ['the actor assigns the card to themselves', null, 'alice', 'todo'],
    ['the assignee moves their own card', 'alice', 'alice', 'doing'],
    ['neither the assignee nor the status changes', 'alice', 'manager', 'todo'],
  ])('sends nothing when %s', async (_case, beforeAssignee, actorId, to) => {
    await usecase.execute({
      before:
        beforeAssignee === null
          ? null
          : card({ statusId: 'todo', assigneeId: beforeAssignee }),
      after: card({ statusId: to, assigneeId: 'alice' }),
      actorId,
    });

    expect(send).not.toHaveBeenCalled();
    expect(findColumn).not.toHaveBeenCalled();
  });

  it('sends nothing when the card is unassigned', async () => {
    await usecase.execute({
      before: card({ statusId: 'todo', assigneeId: 'alice' }),
      after: card({ statusId: 'doing', assigneeId: null }),
      actorId: 'manager',
    });

    expect(send).not.toHaveBeenCalled();
  });

  it('logs and swallows lookup failures', async () => {
    findColumn.mockRejectedValueOnce(new Error('gone'));

    await expect(
      usecase.execute({ before: null, after: card({}), actorId: 'manager' }),
    ).resolves.toBeUndefined();
    expect(send).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith('Failed to send card notifications', {
      cardId: 'card-1',
      error: 'gone',
    });
  });
});
