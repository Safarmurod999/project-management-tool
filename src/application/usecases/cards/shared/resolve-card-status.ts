import {
  BoardRepository,
  CardException,
  ColumnRepository,
  ColumnStatusRepository,
  StatusRepository,
  Workflow,
  WorkflowRepository,
  WorkflowStatusRepository,
  WorkflowTransitionException,
  WorkflowTransitionRepository,
} from 'src/domain';

export interface CardStatusResolverDeps {
  columnRepository: ColumnRepository;
  boardRepository: BoardRepository;
  statusRepository: StatusRepository;
  columnStatusRepository: ColumnStatusRepository;
  workflowRepository: WorkflowRepository;
  workflowStatusRepository: WorkflowStatusRepository;
  workflowTransitionRepository: WorkflowTransitionRepository;
}

export interface ResolveCardStatusParams {
  /** Column the card will be in after the operation. */
  columnId: string;
  /** Status explicitly requested by the caller. */
  requestedStatusId?: string;
  /** Status the card currently has (for updates and moves). */
  currentStatusId?: string;
}

/**
 * Returns the status a card must have in `columnId`, enforcing that the status
 * belongs to the board's project and is mapped to the column.
 *
 * When the project has a default workflow, the status must also be part of
 * it, and changing an existing card's status requires a transition rule from
 * its current status. Projects without a workflow are not restricted.
 *
 * Resolution order: the requested status (validated), then the card's current
 * status if the target column still contains it, then the project default
 * status if mapped to the column and allowed, then the column's first mapped
 * status that is allowed.
 */
export async function resolveCardStatusId(
  deps: CardStatusResolverDeps,
  params: ResolveCardStatusParams,
): Promise<string> {
  const { columnId, requestedStatusId, currentStatusId } = params;

  const column = await deps.columnRepository.findById(columnId);
  const board = await deps.boardRepository.findById(column.boardId);
  const mappings = await deps.columnStatusRepository.findByColumnId(columnId);
  const isMapped = (statusId: string) =>
    mappings.some((mapping) => mapping.statusId === statusId);
  const workflow = await deps.workflowRepository.findDefaultByProjectId(
    board.projectId,
  );

  if (requestedStatusId) {
    const status = await deps.statusRepository.findById(requestedStatusId);

    if (status.projectId !== board.projectId) {
      throw CardException.StatusProjectMismatch(
        requestedStatusId,
        board.projectId,
      );
    }

    if (!isMapped(requestedStatusId)) {
      throw CardException.StatusNotMappedToColumn(requestedStatusId, columnId);
    }

    if (workflow) {
      await assertAllowed(deps, workflow, currentStatusId, requestedStatusId);
    }

    return requestedStatusId;
  }

  if (currentStatusId && isMapped(currentStatusId)) {
    return currentStatusId;
  }

  if (mappings.length === 0) {
    throw CardException.ColumnHasNoStatuses(columnId);
  }

  let candidateIds = mappings.map((mapping) => mapping.statusId);

  if (workflow) {
    candidateIds = await filterAllowed(
      deps,
      workflow,
      currentStatusId,
      candidateIds,
    );

    if (candidateIds.length === 0) {
      throw CardException.NoAllowedStatusInColumn(columnId);
    }
  }

  const statuses = await deps.statusRepository.findByIds(candidateIds);
  const defaultStatus = statuses.find((status) => status.isDefault);

  return defaultStatus ? defaultStatus.id : candidateIds[0];
}

/** Throws unless `toStatusId` is in the workflow and reachable from `fromStatusId`. */
async function assertAllowed(
  deps: CardStatusResolverDeps,
  workflow: Workflow,
  fromStatusId: string | undefined,
  toStatusId: string,
): Promise<void> {
  if (!(await deps.workflowStatusRepository.exists(workflow.id, toStatusId))) {
    throw CardException.StatusNotInWorkflow(toStatusId, workflow.id);
  }

  if (
    fromStatusId &&
    fromStatusId !== toStatusId &&
    !(await deps.workflowTransitionRepository.exists(
      workflow.id,
      fromStatusId,
      toStatusId,
    ))
  ) {
    throw WorkflowTransitionException.TransitionNotAllowed(
      fromStatusId,
      toStatusId,
    );
  }
}

/** Keeps the candidates that are in the workflow and reachable from `fromStatusId`. */
async function filterAllowed(
  deps: CardStatusResolverDeps,
  workflow: Workflow,
  fromStatusId: string | undefined,
  candidateIds: string[],
): Promise<string[]> {
  const members = new Set(
    (await deps.workflowStatusRepository.findByWorkflowId(workflow.id)).map(
      (item) => item.statusId,
    ),
  );
  let allowed = candidateIds.filter((id) => members.has(id));

  if (fromStatusId) {
    const reachable = new Set(
      (
        await deps.workflowTransitionRepository.findFrom(
          workflow.id,
          fromStatusId,
        )
      ).map((rule) => rule.toStatusId),
    );
    allowed = allowed.filter((id) => id === fromStatusId || reachable.has(id));
  }

  return allowed;
}
