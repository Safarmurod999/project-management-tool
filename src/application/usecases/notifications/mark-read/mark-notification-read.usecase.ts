import { Inject } from '@nestjs/common';
import { Notification, NotificationRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  MarkNotificationReadUsecase,
  MarkNotificationReadUsecaseParams,
} from './types';

export class MarkNotificationReadUsecaseImpl
  implements MarkNotificationReadUsecase
{
  constructor(
    @Inject(RepositorySymbols.NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    params: MarkNotificationReadUsecaseParams,
  ): Promise<Notification> {
    return await this.notificationRepository.markAsRead(
      params.id,
      params.userId,
    );
  }
}
