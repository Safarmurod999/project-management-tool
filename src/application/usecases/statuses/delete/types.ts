export interface DeleteStatusUsecaseParams {
  id: string;
}

export interface DeleteStatusUsecase {
  execute(params: DeleteStatusUsecaseParams): Promise<string>;
}
