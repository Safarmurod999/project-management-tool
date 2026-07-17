export interface DeleteBoardUsecaseParams {
  id: string;
}

export interface DeleteBoardUsecase {
  execute(params: DeleteBoardUsecaseParams): Promise<string>;
}
