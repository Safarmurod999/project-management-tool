import {
  BoardRepository,
  CardException,
  ColumnRepository,
  ColumnStatusRepository,
  StatusRepository,
} from 'src/domain';

export interface CardStatusResolverDeps {
  columnRepository: ColumnRepository;
  boardRepository: BoardRepository;
  statusRepository: StatusRepository;
  columnStatusRepository: ColumnStatusRepository;
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
 * Resolution order: the requested status (validated), then the card's current
 * status if the target column still contains it, then the project default
 * status if mapped to the column, then the column's first mapped status.
 */
export async function resolveCardStatusId(
  deps: CardStatusResolverDeps,
  params: ResolveCardStatusParams,
): Promise<string> {
  const { columnId, requestedStatusId, currentStatusId } = params;

  const column = await deps.columnRepository.findById(columnId);
  const mappings = await deps.columnStatusRepository.findByColumnId(columnId);
  const isMapped = (statusId: string) =>
    mappings.some((mapping) => mapping.statusId === statusId);

  if (requestedStatusId) {
    const board = await deps.boardRepository.findById(column.boardId);
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

    return requestedStatusId;
  }

  if (currentStatusId && isMapped(currentStatusId)) {
    return currentStatusId;
  }

  if (mappings.length === 0) {
    throw CardException.ColumnHasNoStatuses(columnId);
  }

  const statuses = await deps.statusRepository.findByIds(
    mappings.map((mapping) => mapping.statusId),
  );
  const defaultStatus = statuses.find((status) => status.isDefault);

  return defaultStatus ? defaultStatus.id : mappings[0].statusId;
}
