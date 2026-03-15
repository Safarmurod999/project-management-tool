export class RolePermissionException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'RolePermissionException';
    this.statusCode = statusCode;
  }

  public static RolePermissionNotFound(id: string): RolePermissionException {
    return new RolePermissionException(`Role permission with ID ${id} not found.`, 404);
  }

  public static InvalidRolePermissionData(reason: string): RolePermissionException {
    return new RolePermissionException(`Invalid role permission data: ${reason}`, 400);
  }

  public static DuplicateRolePermission(roleId: string, permissionId: string): RolePermissionException {
    return new RolePermissionException(
      `Role permission already exists for role ${roleId} and permission ${permissionId}.`,
      409,
    );
  }

  public static RolePermissionInUse(id: string): RolePermissionException {
    return new RolePermissionException(
      `Cannot delete role permission ${id} as it is currently in use.`,
      409,
    );
  }
}