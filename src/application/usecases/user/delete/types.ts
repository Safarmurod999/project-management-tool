export interface DeleteUserUsecaseParams {
  id: string;
}

export interface DeleteUserUsecase {
  execute(params: DeleteUserUsecaseParams): Promise<string>;
}