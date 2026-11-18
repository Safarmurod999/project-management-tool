import { Module } from '@nestjs/common';
import {
  GetNotificationsPresenterImpl,
  NotificationController,
  NotificationPresenterImpl,
} from 'src/adapters';
import {
  GetNotificationsUsecaseImpl,
  MarkAllNotificationsReadUsecaseImpl,
  MarkNotificationReadUsecaseImpl,
  SendNotificationUsecaseImpl,
} from 'src/application';
import {
  NotificationFactoryImpl,
  NotificationRepositoryImpl,
} from 'src/domain';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';

/**
 * Owns user notifications. It imports no feature module, so cards and
 * memberships can import it to send notifications without a module cycle.
 */
@Module({
  controllers: [NotificationController],
  providers: [
    {
      provide: FactorySymbols.NotificationFactory,
      useClass: NotificationFactoryImpl,
    },
    {
      provide: RepositorySymbols.NotificationRepository,
      useClass: NotificationRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Notification.SendNotificationUsecase,
      useClass: SendNotificationUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Notification.GetNotificationsUsecase,
      useClass: GetNotificationsUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Notification.MarkNotificationReadUsecase,
      useClass: MarkNotificationReadUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Notification.MarkAllNotificationsReadUsecase,
      useClass: MarkAllNotificationsReadUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Notification.NotificationPresenter,
      useClass: NotificationPresenterImpl,
    },
    {
      provide: PresenterSymbols.Notification.GetNotificationsPresenter,
      useClass: GetNotificationsPresenterImpl,
    },
  ],
  exports: [UsecaseSymbols.Notification.SendNotificationUsecase],
})
export class NotificationsModule {}
