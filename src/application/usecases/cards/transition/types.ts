import { Card } from 'src/domain';

export interface TransitionCardUsecaseParams {
  cardId: string;
  /** The rule to apply; its fromStatusId must be the card's current status. */
  transitionId?: string;
  /** Alternative to `transitionId`: the rule from the card's current status to this one. */
  toStatusId?: string;
}

export interface TransitionCardUsecase {
  /**
   * Moves the card to another status of its project workflow. The card is moved
   * to the board column holding that status (appended at the end) or keeps its
   * position when the column does not change.
   */
  execute(params: TransitionCardUsecaseParams): Promise<Card>;
}
