import { Inject } from '@nestjs/common';
import {
  Notification,
  NotificationFactory,
  NotificationRepository,
} from 'src/domain';
import { RealtimeService } from 'src/application/services';
import { CommonSymbols } from 'src/infrastructure/dependency-injection/common/symbol';
import { FactorySymbols } from 'src/infrastructure/dependency-injection/factories/symbol';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { Logger } from 'src/infrastructure/logger';
import {
  SendNotificationUsecase,
  SendNotificationUsecaseParams,
} from './types';

export const NOTIFICATION_CREATED_EVENT = 'notification:created';

export class SendNotificationUsecaseImpl implements SendNotificationUsecase {
  constructor(
    @Inject(RepositorySymbols.NotificationRepository)
    private readonly notificationRepository: NotificationRepository,

    @Inject(FactorySymbols.NotificationFactory)
    private readonly notificationFactory: NotificationFactory,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,

    @Inject(CommonSymbols.Logger)
    private readonly logger: Logger,
  ) {}

  async execute(
    params: SendNotificationUsecaseParams,
  ): Promise<Notification | null> {
    // Users are never notified about their own actions.
    if (!params.recipientId || params.recipientId === params.actorId) {
      return null;
    }

    try {
      const data = this.notificationFactory.create({
        userId: params.recipientId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data,
      });

      const notification = await this.notificationRepository.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
      });

      this.socket.emitToUser(
        notification.userId,
        NOTIFICATION_CREATED_EVENT,
        notification,
      );

      return notification;
    } catch (error) {
      this.logger.error('Failed to send notification', {
        type: params.type,
        recipientId: params.recipientId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}
