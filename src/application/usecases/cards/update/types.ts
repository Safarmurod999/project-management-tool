import { CardStatus } from 'src/infrastructure/common/enum';
import { Card } from 'src/domain';

export interface UpdateCardUsecaseParams {
  id: string;
  columnId?: string;
  title?: string;
  description?: string | null;
  order?: number;
  status?: CardStatus;
  assigneeId?: string | null;
  assignerId?: string | null;
  points?: number;
  version?: number;
}

export interface UpdateCardUsecase {
  execute(params: UpdateCardUsecaseParams): Promise<Card>;
}
