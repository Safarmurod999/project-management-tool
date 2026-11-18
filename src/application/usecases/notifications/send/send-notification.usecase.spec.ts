import {
  Notification,
  NotificationCreateParams,
  NotificationFactoryImpl,
  NotificationRepository,
} from 'src/domain';
import { RealtimeService } from 'src/application/services';
import { NotificationType } from 'src/infrastructure/common/enum';
import { Logger } from 'src/infrastructure/logger';
import {
  NOTIFICATION_CREATED_EVENT,
  SendNotificationUsecaseImpl,
} from './send-notification.usecase';

describe('SendNotificationUsecaseImpl', () => {
  let create: jest.Mock;
  let emitToUser: jest.Mock;
  let logError: jest.Mock;
  let usecase: SendNotificationUsecaseImpl;

  const params = {
    recipientId: 'user-2',
    actorId: 'user-1',
    type: NotificationType.CARD_ASSIGNED,
    title: ' New card assigned ',
    message: 'You were assigned to "Login page".',
    data: { cardId: 'card-1' },
  };

  beforeEach(() => {
    create = jest.fn((data: NotificationCreateParams) =>
      Promise.resolve(
        new Notification(
          'n1',
          data.userId,
          data.type,
          data.title,
          data.message,
          data.data,
          null,
          new Date('2026-11-18T10:00:00Z'),
        ),
      ),
    );
    emitToUser = jest.fn();
    logError = jest.fn();
    usecase = new SendNotificationUsecaseImpl(
      { create } as unknown as NotificationRepository,
      new NotificationFactoryImpl(),
      { emitToUser } as unknown as RealtimeService,
      { error: logError } as unknown as Logger,
    );
  });

  it('stores the notification and emits it to the recipient room', async () => {
    const notification = await usecase.execute(params);

    expect(create).toHaveBeenCalledWith({
      userId: 'user-2',
      type: NotificationType.CARD_ASSIGNED,
      title: 'New card assigned',
      message: 'You were assigned to "Login page".',
      data: { cardId: 'card-1' },
    });
    expect(emitToUser).toHaveBeenCalledWith(
      'user-2',
      NOTIFICATION_CREATED_EVENT,
      notification,
    );
    expect(NOTIFICATION_CREATED_EVENT).toBe('notification:created');
  });

  it('emits a payload without private fields', async () => {
    const notification = await usecase.execute(params);

    expect(JSON.parse(JSON.stringify(notification))).toEqual({
      id: 'n1',
      userId: 'user-2',
      type: 'card_assigned',
      title: 'New card assigned',
      message: 'You were assigned to "Login page".',
      data: { cardId: 'card-1' },
      readAt: null,
      createdAt: '2026-11-18T10:00:00.000Z',
    });
  });

  it('never notifies users about their own actions', async () => {
    const result = await usecase.execute({ ...params, actorId: 'user-2' });

    expect(result).toBeNull();
    expect(create).not.toHaveBeenCalled();
    expect(emitToUser).not.toHaveBeenCalled();
  });

  it('does nothing without a recipient', async () => {
    expect(await usecase.execute({ ...params, recipientId: '' })).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it('logs and swallows storage failures', async () => {
    create.mockRejectedValueOnce(new Error('db down'));

    await expect(usecase.execute(params)).resolves.toBeNull();
    expect(emitToUser).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith('Failed to send notification', {
      type: NotificationType.CARD_ASSIGNED,
      recipientId: 'user-2',
      error: 'db down',
    });
  });

  it('logs and swallows socket failures', async () => {
    emitToUser.mockImplementationOnce(() => {
      throw new Error('socket down');
    });

    await expect(usecase.execute(params)).resolves.toBeNull();
    expect(logError).toHaveBeenCalled();
  });
});
