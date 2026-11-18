import { NotificationRepository } from 'src/domain';
import { GetNotificationsUsecaseImpl } from './get-all';
import { MarkAllNotificationsReadUsecaseImpl } from './mark-all-read';
import { MarkNotificationReadUsecaseImpl } from './mark-read';

describe('notification usecases', () => {
  let repository: {
    findByUserId: jest.Mock;
    markAsRead: jest.Mock;
    markAllAsRead: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      findByUserId: jest.fn().mockResolvedValue({
        data: [],
        page: 1,
        limit: 10,
        totalCount: 0,
        unreadCount: 0,
      }),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn().mockResolvedValue(4),
    };
  });

  const as = () => repository as unknown as NotificationRepository;

  it('lists only the caller’s notifications with default paging', async () => {
    await new GetNotificationsUsecaseImpl(as()).execute({ userId: 'user-1' });

    expect(repository.findByUserId).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 1,
      limit: 10,
      unread: false,
    });
  });

  it('passes the unread filter and caps the limit', async () => {
    await new GetNotificationsUsecaseImpl(as()).execute({
      userId: 'user-1',
      page: 2,
      limit: 999,
      unread: true,
    });

    expect(repository.findByUserId).toHaveBeenCalledWith({
      userId: 'user-1',
      page: 2,
      limit: 100,
      unread: true,
    });
  });

  it('marks one notification read for its owner only', async () => {
    await new MarkNotificationReadUsecaseImpl(as()).execute({
      id: 'n1',
      userId: 'user-1',
    });

    expect(repository.markAsRead).toHaveBeenCalledWith('n1', 'user-1');
  });

  it('reports how many notifications were marked read', async () => {
    await expect(
      new MarkAllNotificationsReadUsecaseImpl(as()).execute({
        userId: 'user-1',
      }),
    ).resolves.toEqual({ updated: 4 });
    expect(repository.markAllAsRead).toHaveBeenCalledWith('user-1');
  });
});
