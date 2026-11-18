import { Notification, NotificationData } from 'src/domain';
import { NotificationType } from 'src/infrastructure/common/enum';

export interface SendNotificationUsecaseParams {
  recipientId: string;
  /** The user whose action triggered the notification; never notified. */
  actorId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}

export interface SendNotificationUsecase {
  /**
   * Stores the notification and emits `notification:created` to the
   * recipient's socket room. Best effort: never throws, so callers can run it
   * after their own write without risking the request. Returns `null` when
   * nothing was sent (recipient is the actor, or sending failed).
   */
  execute(params: SendNotificationUsecaseParams): Promise<Notification | null>;
}
