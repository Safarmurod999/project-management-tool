import { Board, Project } from 'src/domain';

export interface GetBoardDetailsUsecaseParams {
  id: string;
}

export interface GetBoardDetailsUsecaseResult {
  board: Board;
  project: Project;
}

export interface GetBoardDetailsUsecase {
  execute(
    params: GetBoardDetailsUsecaseParams,
  ): Promise<GetBoardDetailsUsecaseResult>;
}
