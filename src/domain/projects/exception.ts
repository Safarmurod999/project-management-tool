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

  public static ProjectAlreadyExists(name: string, teamId: string): ProjectException {
    return new ProjectException(
      `Project with name "${name}" already exists in team ${teamId}.`,
      409,
    );
  }

  public static ProjectAlreadyArchived(projectId: string): ProjectException {
    return new ProjectException(
      `Project with ID ${projectId} is already archived.`,
      409,
    );
  }

  public static CannotDeleteActiveProject(projectId: string): ProjectException {
    return new ProjectException(
      `Cannot delete active project with ID ${projectId}. Archive it first.`,
      409,
    );
  }

  public static TeamNotFound(teamId: string): ProjectException {
    return new ProjectException(`Team with ID ${teamId} not found.`, 404);
  }

  public static UnauthorizedProjectAccess(projectId: string): ProjectException {
    return new ProjectException(
      `Unauthorized access to project with ID ${projectId}.`,
      403,
    );
  }

  public static ProjectHasActiveBoards(projectId: string): ProjectException {
    return new ProjectException(
      `Cannot archive project ${projectId} as it has active boards.`,
      409,
    );
  }
}
