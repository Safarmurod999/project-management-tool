export class BoardException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'BoardException';
    this.statusCode = statusCode;
  }

  public static BoardNotFound(boardId: string): BoardException {
    return new BoardException(`Board with ID ${boardId} not found.`, 404);
  }

  public static InvalidBoardData(reason: string): BoardException {
    return new BoardException(`Invalid board data: ${reason}`, 400);
  }
}