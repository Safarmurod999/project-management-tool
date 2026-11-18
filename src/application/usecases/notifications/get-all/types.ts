import { NotificationGetResponse } from 'src/domain';

export interface GetNotificationsUsecaseParams {
  /** The authenticated user; only their notifications are returned. */
  userId: string;
  page?: number;
  limit?: number;
  unread?: boolean;
}

export interface GetNotificationsUsecase {
  execute(
    params: GetNotificationsUsecaseParams,
  ): Promise<NotificationGetResponse>;
}
