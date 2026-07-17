import { Board } from 'src/domain';

export interface FindBoardByIdUsecaseParams {
  id: string;
}

export interface FindBoardByIdUsecase {
  execute(params: FindBoardByIdUsecaseParams): Promise<Board>;
}
