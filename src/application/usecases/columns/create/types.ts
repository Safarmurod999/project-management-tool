import { Column } from 'src/domain';

export interface CreateColumnUsecaseParams {
  boardId: string;
  name: string;
  order?: number;
  /** Statuses to map to the new column, in display order. */
  statusIds?: string[];
}

export interface CreateColumnUsecase {
  execute(params: CreateColumnUsecaseParams): Promise<Column>;
}
