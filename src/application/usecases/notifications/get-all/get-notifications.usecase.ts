import { Inject } from '@nestjs/common';
import { NotificationGetResponse, NotificationRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { normalizePagination } from '../../shared';
import {
  GetNotificationsUsecase,
  GetNotificationsUsecaseParams,
} from './types';

export class GetNotificationsUsecaseImpl implements GetNotificationsUsecase {
  constructor(
    @Inject(RepositorySymbols.NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    params: GetNotificationsUsecaseParams,
  ): Promise<NotificationGetResponse> {
    const { page, limit } = normalizePagination(params);

    return await this.notificationRepository.findByUserId({
      userId: params.userId,
      page,
      limit,
      unread: params.unread ?? false,
    });
  }
}
