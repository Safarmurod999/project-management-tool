export interface DeleteWorkflowUsecaseParams {
  id: string;
}

export interface DeleteWorkflowUsecase {
  execute(params: DeleteWorkflowUsecaseParams): Promise<string>;
}
