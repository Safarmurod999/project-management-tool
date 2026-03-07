export interface DeleteTeamUsecaseParams {
  id: string;
}

export interface DeleteTeamUsecase {
  execute(params: DeleteTeamUsecaseParams): Promise<string>;
}
