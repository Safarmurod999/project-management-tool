import { WorkflowDetails } from '../shared';

export interface RemoveWorkflowStatusUsecaseParams {
  workflowId: string;
  statusId: string;
}

export interface RemoveWorkflowStatusUsecase {
  /** Removes the status and every transition that starts or ends at it. */
  execute(params: RemoveWorkflowStatusUsecaseParams): Promise<WorkflowDetails>;
}
