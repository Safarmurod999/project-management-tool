import {
  StatusStruct,
  WorkflowStruct,
  WorkflowTransitionStruct,
} from 'src/domain';
import { WorkflowDetails } from 'src/application';

export interface WorkflowDetailsResponse extends WorkflowStruct {
  statuses: StatusStruct[];
  transitions: WorkflowTransitionStruct[];
}

/** Shared by every workflow endpoint that returns the full configuration. */
export interface WorkflowDetailsPresenter {
  present(details: WorkflowDetails): WorkflowDetailsResponse;
}

export class WorkflowDetailsPresenterImpl implements WorkflowDetailsPresenter {
  present({
    workflow,
    statuses,
    transitions,
  }: WorkflowDetails): WorkflowDetailsResponse {
    return {
      id: workflow.id,
      projectId: workflow.projectId,
      name: workflow.name,
      description: workflow.description,
      isDefault: workflow.isDefault,
      version: workflow.version,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      statuses: statuses.map((status) => ({
        id: status.id,
        projectId: status.projectId,
        name: status.name,
        code: status.code,
        color: status.color,
        order: status.order,
        isDefault: status.isDefault,
        version: status.version,
        createdAt: status.createdAt,
        updatedAt: status.updatedAt,
      })),
      transitions: transitions.map((transition) => ({
        id: transition.id,
        workflowId: transition.workflowId,
        fromStatusId: transition.fromStatusId,
        toStatusId: transition.toStatusId,
        createdAt: transition.createdAt,
        updatedAt: transition.updatedAt,
      })),
    };
  }
}
