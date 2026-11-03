import { Card } from 'src/domain';

export interface ReorderCardUsecaseParams {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  newIndex: number;
  /** Must be mapped to the target column; resolved automatically when omitted. */
  statusId?: string;
  /** Rejects the move if the card left this status after it was read (used by status transitions). */
  expectedStatusId?: string;
}

export interface ReorderCardUsecase {
  execute(params: ReorderCardUsecaseParams): Promise<Card>;
}
