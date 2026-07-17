export interface DeleteMembershipUsecaseParams {
  id: string;
}

export interface DeleteMembershipUsecase {
  execute(params: DeleteMembershipUsecaseParams): Promise<string>;
}
