import { Workflow, WorkflowStruct } from 'src/domain';

export interface GetWorkflowsPresenter {
  present(workflows: Workflow[]): WorkflowStruct[];
}

export class GetWorkflowsPresenterImpl implements GetWorkflowsPresenter {
  present(workflows: Workflow[]): WorkflowStruct[] {
    return workflows.map((workflow) => ({
      id: workflow.id,
      projectId: workflow.projectId,
      name: workflow.name,
      description: workflow.description,
      isDefault: workflow.isDefault,
      version: workflow.version,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    }));
  }
}
