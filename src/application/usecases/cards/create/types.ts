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
  /** The user creating the card; not notified about their own action. */
  actorId?: string;
}

export interface CreateCardUsecase {
  execute(params: CreateCardUsecaseParams): Promise<Card>;
}
