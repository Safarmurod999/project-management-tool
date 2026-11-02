export class StatusException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'StatusException';
    this.statusCode = statusCode;
  }

  static StatusNotFound(id: string): StatusException {
    return new StatusException(`Status with ID ${id} not found.`, 404);
  }

  static InvalidName(): StatusException {
    return new StatusException('Status name is invalid.', 400);
  }

  static InvalidCode(): StatusException {
    return new StatusException(
      'Status code is invalid. Use lowercase letters, digits and underscores.',
      400,
    );
  }

  static InvalidColor(): StatusException {
    return new StatusException(
      'Status color is invalid. Use a hex color such as #1E88E5.',
      400,
    );
  }

  static InvalidOrder(): StatusException {
    return new StatusException('Status order is invalid.', 400);
  }

  static InvalidProjectId(projectId: string): StatusException {
    return new StatusException(`Project with ID ${projectId} not found.`, 404);
  }

  static StatusAlreadyExists(code: string, projectId: string): StatusException {
    return new StatusException(
      `Status with code "${code}" already exists in project ${projectId}.`,
      409,
    );
  }

  static StatusInUse(id: string): StatusException {
    return new StatusException(
      `Status with ID ${id} is used by existing cards.`,
      409,
    );
  }

  static CannotDeleteDefaultStatus(id: string): StatusException {
    return new StatusException(
      `Status with ID ${id} is the project default. Mark another status as default first.`,
      409,
    );
  }

  static ProjectMismatch(statusId: string, projectId: string): StatusException {
    return new StatusException(
      `Status with ID ${statusId} does not belong to project ${projectId}.`,
      400,
    );
  }
}
