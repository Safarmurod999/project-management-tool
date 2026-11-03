import {
  Board,
  BoardRepository,
  Card,
  CardRepository,
  Column,
  ColumnRepository,
  ColumnStatus,
  ColumnStatusRepository,
  Workflow,
  WorkflowRepository,
  WorkflowTransition,
  WorkflowTransitionException,
  WorkflowTransitionRepository,
} from 'src/domain';
import { BoardStatus } from 'src/infrastructure/common/enum';
import { ReorderCardUsecase } from '../reorder';
import { TransitionCardUsecaseImpl } from './transition-card.usecase';

describe('TransitionCardUsecaseImpl', () => {
  let workflow: Workflow | null;
  let transitions: WorkflowTransition[];
  let reorderCardUsecase: jest.Mocked<ReorderCardUsecase>;
  let usecase: TransitionCardUsecaseImpl;

  const rule = (id: string, from: string, to: string, workflowId = 'w1') =>
    new WorkflowTransition(id, workflowId, from, to, new Date());

  beforeEach(() => {
    workflow = new Workflow('w1', 'p1', 'Flow', null, true, 1, new Date());
    transitions = [
      rule('t-start', 'todo', 'in_progress'),
      rule('t-test', 'in_progress', 'testing'),
      rule('t-other', 'todo', 'done', 'w2'),
    ];
    // col-todo: todo; col-progress: in_progress, testing.
    const mappings = [
      new ColumnStatus('m1', 'col-todo', 'todo', 0, new Date()),
      new ColumnStatus('m2', 'col-progress', 'in_progress', 0, new Date()),
      new ColumnStatus('m3', 'col-progress', 'testing', 1, new Date()),
    ];
    const cards: Record<string, Card> = {
      'card-todo': new Card('card-todo', 'col-todo', 'A', null, 2, 'todo'),
      'card-progress': new Card(
        'card-progress',
        'col-progress',
        'B',
        null,
        4,
        'in_progress',
      ),
    };

    reorderCardUsecase = {
      execute: jest.fn(
        async (params) =>
          new Card(
            params.cardId,
            params.targetColumnId,
            'X',
            null,
            0,
            params.statusId!,
          ),
      ),
    };

    usecase = new TransitionCardUsecaseImpl(
      {
        findById: jest.fn(async (id: string) => cards[id]),
      } as unknown as CardRepository,
      {
        findById: jest.fn(
          async (id: string) => new Column(id, 'b1', id, 0, 1, new Date()),
        ),
      } as unknown as ColumnRepository,
      {
        findById: jest.fn(
          async () =>
            new Board('b1', 'p1', 'B', null, BoardStatus.ACTIVE, 1, new Date()),
        ),
      } as unknown as BoardRepository,
      {
        findByBoardId: jest.fn(async () => mappings),
      } as unknown as ColumnStatusRepository,
      {
        findDefaultByProjectId: jest.fn(async () => workflow),
      } as unknown as WorkflowRepository,
      {
        findById: jest.fn(async (id: string) => {
          const found = transitions.find((item) => item.id === id);
          if (!found) throw WorkflowTransitionException.TransitionNotFound(id);
          return found;
        }),
        findOne: jest.fn(
          async (workflowId: string, from: string, to: string) =>
            transitions.find(
              (item) =>
                item.workflowId === workflowId &&
                item.fromStatusId === from &&
                item.toStatusId === to,
            ) ?? null,
        ),
      } as unknown as WorkflowTransitionRepository,
      reorderCardUsecase,
    );
  });

  it('moves the card to the column holding the target status', async () => {
    const card = await usecase.execute({
      cardId: 'card-todo',
      transitionId: 't-start',
    });

    expect(card.statusId).toBe('in_progress');
    expect(reorderCardUsecase.execute).toHaveBeenCalledWith({
      cardId: 'card-todo',
      sourceColumnId: 'col-todo',
      targetColumnId: 'col-progress',
      newIndex: Number.MAX_SAFE_INTEGER,
      statusId: 'in_progress',
      expectedStatusId: 'todo',
    });
  });

  it('keeps the position when the column does not change', async () => {
    await usecase.execute({ cardId: 'card-progress', toStatusId: 'testing' });

    expect(reorderCardUsecase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceColumnId: 'col-progress',
        targetColumnId: 'col-progress',
        newIndex: 4,
        statusId: 'testing',
        expectedStatusId: 'in_progress',
      }),
    );
  });

  it("rejects a transition that does not start at the card's status", async () => {
    await expect(
      usecase.execute({ cardId: 'card-todo', transitionId: 't-test' }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('transition starts at in_progress'),
    });
    expect(reorderCardUsecase.execute).not.toHaveBeenCalled();
  });

  it('rejects a target status without a rule', async () => {
    await expect(
      usecase.execute({ cardId: 'card-todo', toStatusId: 'testing' }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('not allowed'),
    });
  });

  it('rejects a transition of another workflow', async () => {
    await expect(
      usecase.execute({ cardId: 'card-todo', transitionId: 't-other' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('requires a transition or a target status', async () => {
    await expect(
      usecase.execute({ cardId: 'card-todo' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('fails when the project has no workflow', async () => {
    workflow = null;

    await expect(
      usecase.execute({ cardId: 'card-todo', toStatusId: 'in_progress' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
