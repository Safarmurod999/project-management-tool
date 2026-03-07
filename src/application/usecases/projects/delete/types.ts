export interface DeleteProjectUsecaseParams {
  id: string;
}

export interface DeleteProjectUsecase {
  execute(params: DeleteProjectUsecaseParams): Promise<string>;
}
