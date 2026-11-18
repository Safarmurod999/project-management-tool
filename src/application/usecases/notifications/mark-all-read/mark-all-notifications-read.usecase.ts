import { Inject } from '@nestjs/common';
import { NotificationRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  MarkAllNotificationsReadUsecase,
  MarkAllNotificationsReadUsecaseParams,
} from './types';

export class MarkAllNotificationsReadUsecaseImpl
  implements MarkAllNotificationsReadUsecase
{
  constructor(
    @Inject(RepositorySymbols.NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    params: MarkAllNotificationsReadUsecaseParams,
  ): Promise<{ updated: number }> {
    const updated = await this.notificationRepository.markAllAsRead(
      params.userId,
    );

    return { updated };
  }
}
