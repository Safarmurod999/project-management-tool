import { BoardStatus } from 'src/infrastructure/common/enum';
import { Board } from 'src/domain';

export interface UpdateBoardUsecaseParams {
  id: string;
  name?: string;
  description?: string | null;
  projectId?: string;
  status?: BoardStatus;
  version?: number;
}

export interface UpdateBoardUsecase {
  execute(params: UpdateBoardUsecaseParams): Promise<Board>;
}
