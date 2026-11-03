import { WorkflowDetails } from '../shared';

export interface CreateWorkflowTransitionUsecaseParams {
  workflowId: string;
  fromStatusId: string;
  toStatusId: string;
  /**
   * Also allows the reverse move. Stored as two one-way rules; a direction that
   * already exists is kept, and the request fails only if both exist.
   */
  bidirectional?: boolean;
}

export interface CreateWorkflowTransitionUsecase {
  execute(
    params: CreateWorkflowTransitionUsecaseParams,
  ): Promise<WorkflowDetails>;
}
