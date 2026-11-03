import { WorkflowDetails } from '../shared';

export interface CreateWorkflowTransitionInput {
  fromStatusId: string;
  toStatusId: string;
  /** Also creates the reverse rule (to -> from). */
  bidirectional?: boolean;
}

export interface CreateWorkflowUsecaseParams {
  projectId: string;
  name: string;
  description?: string | null;
  /** The first workflow of a project always becomes the default. */
  isDefault?: boolean;
  statusIds?: string[];
  transitions?: CreateWorkflowTransitionInput[];
}

export interface CreateWorkflowUsecase {
  execute(params: CreateWorkflowUsecaseParams): Promise<WorkflowDetails>;
}
