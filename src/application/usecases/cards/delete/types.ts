export interface DeleteCardUsecaseParams {
  id: string;
}

export interface DeleteCardUsecase {
  execute(params: DeleteCardUsecaseParams): Promise<string>;
}
