import { WorkflowDetails } from '../shared';

export interface DeleteWorkflowTransitionUsecaseParams {
  workflowId: string;
  transitionId: string;
}

export interface DeleteWorkflowTransitionUsecase {
  execute(
    params: DeleteWorkflowTransitionUsecaseParams,
  ): Promise<WorkflowDetails>;
}
