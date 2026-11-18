import { Notification } from 'src/domain';

export interface MarkNotificationReadUsecaseParams {
  id: string;
  /** The authenticated user; another user's notification is a 404. */
  userId: string;
}

export interface MarkNotificationReadUsecase {
  execute(params: MarkNotificationReadUsecaseParams): Promise<Notification>;
}
