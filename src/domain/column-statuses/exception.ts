export class ColumnStatusException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ColumnStatusException';
    this.statusCode = statusCode;
  }

  static MappingNotFound(
    columnId: string,
    statusId: string,
  ): ColumnStatusException {
    return new ColumnStatusException(
      `Status ${statusId} is not mapped to column ${columnId}.`,
      404,
    );
  }

  static InvalidColumnId(columnId: string): ColumnStatusException {
    return new ColumnStatusException(
      `Column with ID ${columnId} not found.`,
      404,
    );
  }

  static InvalidStatusId(statusId: string): ColumnStatusException {
    return new ColumnStatusException(
      `Status with ID ${statusId} not found.`,
      404,
    );
  }

  static InvalidOrder(): ColumnStatusException {
    return new ColumnStatusException('Column status order is invalid.', 400);
  }

  static ProjectMismatch(
    statusId: string,
    boardId: string,
  ): ColumnStatusException {
    return new ColumnStatusException(
      `Status ${statusId} does not belong to the project of board ${boardId}.`,
      400,
    );
  }

  static StatusAlreadyMapped(
    statusId: string,
    boardId: string,
  ): ColumnStatusException {
    return new ColumnStatusException(
      `Status ${statusId} is already mapped to a column of board ${boardId}.`,
      409,
    );
  }

  static StatusInUseByCards(
    columnId: string,
    statusId: string,
  ): ColumnStatusException {
    return new ColumnStatusException(
      `Cards in column ${columnId} still use status ${statusId}. Move them to another status first.`,
      409,
    );
  }
}
