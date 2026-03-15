export class PermissionException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'PermissionException';
    this.statusCode = statusCode;
  }

  public static PermissionNotFound(permissionId: string): PermissionException {
    return new PermissionException(`Permission with ID ${permissionId} not found.`, 404);
  }

  public static InvalidPermissionData(reason: string): PermissionException {
    return new PermissionException(`Invalid permission data: ${reason}`, 400);
  }

  public static PermissionAlreadyExists(name: string): PermissionException {
    return new PermissionException(`Permission with name "${name}" already exists.`, 409);
  }

  public static CannotDeleteSystemPermission(permissionId: string): PermissionException {
    return new PermissionException(
      `Cannot delete system permission with ID ${permissionId}.`,
      409,
    );
  }

  public static PermissionInUse(permissionId: string): PermissionException {
    return new PermissionException(
      `Cannot delete permission ${permissionId} as it is currently assigned to roles.`,
      409,
    );
  }

  public static InvalidPermissionScope(): PermissionException {
    return new PermissionException(`Invalid permission scope provided.`, 400);
  }

  public static UnauthorizedPermissionAccess(permissionId: string): PermissionException {
    return new PermissionException(
      `Unauthorized access to permission with ID ${permissionId}.`,
      403,
    );
  }
}
