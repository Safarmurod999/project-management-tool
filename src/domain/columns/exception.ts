export class ColumnException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ColumnException';
    this.statusCode = statusCode;
  }

  static ColumnNotFound(id: string): ColumnException {
    return new ColumnException(`Column with ID ${id} not found.`, 404);
  }

  static InvalidName(): ColumnException {
    return new ColumnException('Column name is invalid.', 400);
  }

  static InvalidOrder(): ColumnException {
    return new ColumnException('Column order is invalid.', 400);
  }

  static InvalidBoardId(boardId: string): ColumnException {
    return new ColumnException(`Board with ID ${boardId} not found.`, 404);
  }

  static ColumnAlreadyExists(name: string, boardId: string): ColumnException {
    return new ColumnException(
      `Column with name "${name}" already exists in board ${boardId}.`,
      409,
    );
  }
}
