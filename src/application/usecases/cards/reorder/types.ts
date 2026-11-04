import { Card } from 'src/domain';

export interface ReorderCardUsecaseParams {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  newIndex: number;
  /** Must be mapped to the target column; resolved automatically when omitted. */
  statusId?: string;
  /**
   * Rejects the move unless the card is in this status (used by status
   * transitions). The status read at the start is re-checked at write time
   * either way.
   */
  expectedStatusId?: string;
}

export interface ReorderCardUsecase {
  execute(params: ReorderCardUsecaseParams): Promise<Card>;
}
