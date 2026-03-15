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

  public static BoardAlreadyExists(name: string, projectId: string): BoardException {
    return new BoardException(
      `Board with name "${name}" already exists in project ${projectId}.`,
      409,
    );
  }

  public static BoardAlreadyArchived(boardId: string): BoardException {
    return new BoardException(
      `Board with ID ${boardId} is already archived.`,
      409,
    );
  }

  public static CannotDeleteActiveBoard(boardId: string): BoardException {
    return new BoardException(
      `Cannot delete active board with ID ${boardId}. Archive it first.`,
      409,
    );
  }

  public static ProjectNotFound(projectId: string): BoardException {
    return new BoardException(`Project with ID ${projectId} not found.`, 404);
  }

  public static UnauthorizedBoardAccess(boardId: string): BoardException {
    return new BoardException(
      `Unauthorized access to board with ID ${boardId}.`,
      403,
    );
  }
}