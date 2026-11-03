import { WorkflowDetails } from '../shared';

export interface AddWorkflowStatusUsecaseParams {
  workflowId: string;
  statusId: string;
}

export interface AddWorkflowStatusUsecase {
  execute(params: AddWorkflowStatusUsecaseParams): Promise<WorkflowDetails>;
}
