import { Notification, NotificationStruct } from 'src/domain';
import { NotificationPresenterImpl } from './notification.presenter';

export interface GetNotificationsPresenter {
  present(notifications: Notification[]): NotificationStruct[];
}

export class GetNotificationsPresenterImpl
  implements GetNotificationsPresenter
{
  private readonly item = new NotificationPresenterImpl();

  present(notifications: Notification[]): NotificationStruct[] {
    return notifications.map((notification) => this.item.present(notification));
  }
}
