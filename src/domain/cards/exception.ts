export class CardException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'CardException';
    this.statusCode = statusCode;
  }

  static CardNotFound(id: string): CardException {
    return new CardException(`Card with ID ${id} not found.`, 404);
  }

  static InvalidTitle(): CardException {
    return new CardException('Card title is invalid.', 400);
  }

  static InvalidOrder(): CardException {
    return new CardException('Card order is invalid.', 400);
  }

  static InvalidPoints(): CardException {
    return new CardException('Card points must be zero or greater.', 400);
  }

  static InvalidColumnId(columnId: string): CardException {
    return new CardException(`Column with ID ${columnId} not found.`, 404);
  }

  static StatusNotMappedToColumn(
    statusId: string,
    columnId: string,
  ): CardException {
    return new CardException(
      `Status ${statusId} is not mapped to column ${columnId}.`,
      400,
    );
  }

  static StatusProjectMismatch(
    statusId: string,
    projectId: string,
  ): CardException {
    return new CardException(
      `Status ${statusId} does not belong to project ${projectId}.`,
      400,
    );
  }

  static ColumnHasNoStatuses(columnId: string): CardException {
    return new CardException(
      `Column ${columnId} has no statuses mapped. Map a status to the column before adding cards.`,
      409,
    );
  }

  static StatusNotInWorkflow(
    statusId: string,
    workflowId: string,
  ): CardException {
    return new CardException(
      `Status ${statusId} is not part of workflow ${workflowId}.`,
      400,
    );
  }

  static NoAllowedStatusInColumn(columnId: string): CardException {
    return new CardException(
      `No status of column ${columnId} can be reached under the project workflow.`,
      409,
    );
  }

  static StatusNotOnBoard(statusId: string, boardId: string): CardException {
    return new CardException(
      `Status ${statusId} is not mapped to any column of board ${boardId}.`,
      409,
    );
  }

  static CurrentStatusMismatch(
    cardId: string,
    expectedStatusId: string,
  ): CardException {
    return new CardException(
      `Card ${cardId} is no longer in status ${expectedStatusId}. Reload it and try again.`,
      409,
    );
  }

  static TransitionFromMismatch(
    cardId: string,
    currentStatusId: string,
    fromStatusId: string,
  ): CardException {
    return new CardException(
      `Card ${cardId} is in status ${currentStatusId}, but the transition starts at ${fromStatusId}.`,
      409,
    );
  }

  static TransitionTargetRequired(): CardException {
    return new CardException(
      'Provide either transitionId or toStatusId.',
      400,
    );
  }

  static CardAlreadyExists(title: string, columnId: string): CardException {
    return new CardException(
      `Card with title "${title}" already exists in column ${columnId}.`,
      409,
    );
  }
}
