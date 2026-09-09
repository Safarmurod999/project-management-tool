import { CardStatus } from 'src/infrastructure/common/enum';
import { Card } from 'src/domain';

export interface ReorderCardUsecaseParams {
  cardId: string;
  sourceColumnId: string;
  targetColumnId: string;
  newIndex: number;
  status?: CardStatus;
}

export interface ReorderCardUsecase {
  execute(params: ReorderCardUsecaseParams): Promise<Card>;
}
