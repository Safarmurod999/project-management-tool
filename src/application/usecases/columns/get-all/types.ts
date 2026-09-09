import { ColumnGetResponse } from 'src/domain';

export interface GetColumnsUsecaseParams {
  page?: number;
  limit?: number;
  boardId: string;
  name?: string;
}

export interface GetColumnsUsecase {
  execute(params: GetColumnsUsecaseParams): Promise<ColumnGetResponse>;
}
