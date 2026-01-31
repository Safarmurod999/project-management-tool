export interface DeletePermissionUsecaseParams {
  id: string;
}

export interface DeletePermissionUsecase {
  execute(params: DeletePermissionUsecaseParams): Promise<string>;
}
