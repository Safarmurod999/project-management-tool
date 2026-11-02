import { Card } from 'src/domain';

export interface CreateCardUsecaseParams {
  columnId: string;
  title: string;
  description?: string | null;
  order?: number;
  /** Defaults to the project default status (or the column's first status). */
  statusId?: string;
  assigneeId?: string | null;
  assignerId?: string | null;
  points?: number;
}

export interface CreateCardUsecase {
  execute(params: CreateCardUsecaseParams): Promise<Card>;
}
