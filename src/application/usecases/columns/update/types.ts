import { BoardStatus } from 'src/infrastructure/common/enum';
import { Column } from 'src/domain';

export interface UpdateColumnUsecaseParams {
  id: string;
  boardId?: string;
  name?: string;
  order?: number;
  status?: BoardStatus;
  version?: number;
}

export interface UpdateColumnUsecase {
  execute(params: UpdateColumnUsecaseParams): Promise<Column>;
}
