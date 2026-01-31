export interface DeleteRoleUsecaseParams {
  id: string;
}

export interface DeleteRoleUsecase {
  execute(params: DeleteRoleUsecaseParams): Promise<string>;
}
