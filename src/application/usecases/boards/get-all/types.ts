import { BoardGetResponse } from 'src/domain';

export interface GetBoardsUsecaseParams {
  page?: number;
  limit?: number;
  name?: string;
  projectId?: string;
}

export interface GetBoardsUsecase {
  execute(params: GetBoardsUsecaseParams): Promise<BoardGetResponse>;
}
