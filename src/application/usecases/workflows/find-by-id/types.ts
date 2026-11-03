import { WorkflowDetails } from '../shared';

export interface FindWorkflowByIdUsecaseParams {
  id: string;
}

export interface FindWorkflowByIdUsecase {
  execute(params: FindWorkflowByIdUsecaseParams): Promise<WorkflowDetails>;
}
