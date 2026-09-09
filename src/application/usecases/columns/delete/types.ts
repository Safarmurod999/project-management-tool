export interface DeleteColumnUsecaseParams {
  id: string;
}

export interface DeleteColumnUsecase {
  execute(params: DeleteColumnUsecaseParams): Promise<string>;
}
