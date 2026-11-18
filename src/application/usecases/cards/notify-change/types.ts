import { Card } from 'src/domain';

export interface NotifyCardChangeUsecaseParams {
  /** The card before the change; `null` for a new card. */
  before: Card | null;
  /** The card as saved. */
  after: Card;
  /** The user who made the change; never notified. */
  actorId?: string;
}

export interface NotifyCardChangeUsecase {
  /**
   * Sends `card_assigned` to a new assignee and `card_status_changed` to the
   * assignee when the status changed. Call it after the change is saved.
   * Best effort: never throws.
   */
  execute(params: NotifyCardChangeUsecaseParams): Promise<void>;
}
