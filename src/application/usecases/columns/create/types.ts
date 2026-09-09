import { BoardStatus } from 'src/infrastructure/common/enum';
import { Column } from 'src/domain';

export interface CreateColumnUsecaseParams {
  boardId: string;
  name: string;
  order?: number;
  status?: BoardStatus;
}

export interface CreateColumnUsecase {
  execute(params: CreateColumnUsecaseParams): Promise<Column>;
}
