import { Board } from 'src/domain';

export interface CreateBoardUsecaseParams {
  projectId: string;
  name: string;
  description: string;
}

export interface CreateBoardUsecase {
  execute(params: CreateBoardUsecaseParams): Promise<Board>;
}
