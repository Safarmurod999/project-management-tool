import { Card } from 'src/domain';

export interface ReorderCardUsecaseParams {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  newIndex: number;
  /** Must be mapped to the target column; resolved automatically when omitted. */
  statusId?: string;
}

export interface ReorderCardUsecase {
  execute(params: ReorderCardUsecaseParams): Promise<Card>;
}
