import { CardStatus } from 'src/infrastructure/common/enum';
import { Card } from 'src/domain';

export interface CreateCardUsecaseParams {
  columnId: string;
  title: string;
  description?: string | null;
  order?: number;
  status?: CardStatus;
  assigneeId?: string | null;
  assignerId?: string | null;
  points?: number;
}

export interface CreateCardUsecase {
  execute(params: CreateCardUsecaseParams): Promise<Card>;
}
