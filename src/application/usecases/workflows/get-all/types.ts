import { WorkflowGetResponse } from 'src/domain';

export interface GetWorkflowsUsecaseParams {
  page?: number;
  limit?: number;
  projectId: string;
  name?: string;
}

export interface GetWorkflowsUsecase {
  execute(params: GetWorkflowsUsecaseParams): Promise<WorkflowGetResponse>;
}
