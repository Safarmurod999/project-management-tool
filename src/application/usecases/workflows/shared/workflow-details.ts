import {
  Status,
  StatusRepository,
  Workflow,
  WorkflowStatusRepository,
  WorkflowTransition,
  WorkflowTransitionRepository,
} from 'src/domain';

/** A workflow together with the statuses it allows and its transition rules. */
export interface WorkflowDetails {
  workflow: Workflow;
  statuses: Status[];
  transitions: WorkflowTransition[];
}

export interface WorkflowDetailsDeps {
  statusRepository: StatusRepository;
  workflowStatusRepository: WorkflowStatusRepository;
  workflowTransitionRepository: WorkflowTransitionRepository;
}

export async function loadWorkflowDetails(
  deps: WorkflowDetailsDeps,
  workflow: Workflow,
): Promise<WorkflowDetails> {
  const memberships = await deps.workflowStatusRepository.findByWorkflowId(
    workflow.id,
  );
  const statuses = await deps.statusRepository.findByIds(
    memberships.map((item) => item.statusId),
  );
  const transitions = await deps.workflowTransitionRepository.findByWorkflowId(
    workflow.id,
  );

  return { workflow, statuses, transitions };
}

/** Socket.IO payload for `workflow:created` / `workflow:updated`. */
export function toWorkflowEvent(details: WorkflowDetails) {
  return {
    ...details.workflow.toJSON(),
    statuses: details.statuses.map((status) => status.toJSON()),
    transitions: details.transitions.map((transition) => transition.toJSON()),
  };
}
