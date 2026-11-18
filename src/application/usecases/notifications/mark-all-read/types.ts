export interface MarkAllNotificationsReadUsecaseParams {
  userId: string;
}

export interface MarkAllNotificationsReadUsecase {
  /** Returns the number of notifications that were unread. */
  execute(
    params: MarkAllNotificationsReadUsecaseParams,
  ): Promise<{ updated: number }>;
}
