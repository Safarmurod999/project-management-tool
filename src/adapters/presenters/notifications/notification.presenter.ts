import { Notification, NotificationStruct } from 'src/domain';

export interface NotificationPresenter {
  present(notification: Notification): NotificationStruct;
}

export class NotificationPresenterImpl implements NotificationPresenter {
  present(notification: Notification): NotificationStruct {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
