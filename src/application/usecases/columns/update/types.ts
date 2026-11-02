import { Column } from 'src/domain';

export interface UpdateColumnUsecaseParams {
  id: string;
  boardId?: string;
  name?: string;
  order?: number;
  version?: number;
}

export interface UpdateColumnUsecase {
  execute(params: UpdateColumnUsecaseParams): Promise<Column>;
}
