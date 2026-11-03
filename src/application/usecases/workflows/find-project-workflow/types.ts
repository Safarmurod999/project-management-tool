import { WorkflowDetails } from '../shared';

export interface FindProjectWorkflowUsecaseParams {
  projectId: string;
}

export interface FindProjectWorkflowUsecase {
  /** Returns the project's default workflow, which governs its cards. */
  execute(params: FindProjectWorkflowUsecaseParams): Promise<WorkflowDetails>;
}
