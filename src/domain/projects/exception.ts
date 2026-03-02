export class ProjectException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'ProjectException';
    this.statusCode = statusCode;
  }

  public static ProjectNotFound(projectId: string): ProjectException {
    return new ProjectException(`Project with ID ${projectId} not found.`, 404);
  }

  public static InvalidProjectData(reason: string): ProjectException {
    return new ProjectException(`Invalid project data: ${reason}`, 400);
  }

  public static UnauthorizedAccess(action: string): ProjectException {
    return new ProjectException(
      `Unauthorized access attempt to ${action}.`,
      401,
    );
  }
}
