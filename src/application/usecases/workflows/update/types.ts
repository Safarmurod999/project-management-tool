import { WorkflowDetails } from '../shared';

export interface UpdateWorkflowUsecaseParams {
  id: string;
  name?: string;
  description?: string | null;
  /** Only `true` is accepted on a non-default workflow; it replaces the current default. */
  isDefault?: boolean;
  version?: number;
}

export interface UpdateWorkflowUsecase {
  execute(params: UpdateWorkflowUsecaseParams): Promise<WorkflowDetails>;
}
