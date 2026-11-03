import { WorkflowDetails } from '../shared';

export interface UpdateWorkflowTransitionUsecaseParams {
  workflowId: string;
  transitionId: string;
  fromStatusId?: string;
  toStatusId?: string;
}

export interface UpdateWorkflowTransitionUsecase {
  execute(
    params: UpdateWorkflowTransitionUsecaseParams,
  ): Promise<WorkflowDetails>;
}
