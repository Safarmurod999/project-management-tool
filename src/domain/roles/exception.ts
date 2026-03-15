export class RoleException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'RoleException';
    this.statusCode = statusCode;
  }

  public static RoleNotFound(roleId?: string): RoleException {
    return new RoleException(`Role${roleId ? ` with ID ${roleId}` : ''} not found.`, 404);
  }

  public static InvalidRoleData(reason: string): RoleException {
    return new RoleException(`Invalid role data: ${reason}`, 400);
  }

  public static RoleAlreadyExists(name: string, scopeId: string): RoleException {
    return new RoleException(
      `Role with name "${name}" already exists in scope ${scopeId}.`,
      409,
    );
  }

  public static CannotDeleteSystemRole(roleId: string): RoleException {
    return new RoleException(
      `Cannot delete system role with ID ${roleId}.`,
      409,
    );
  }

  public static RoleInUse(roleId: string): RoleException {
    return new RoleException(
      `Cannot delete role ${roleId} as it is currently assigned to users.`,
      409,
    );
  }

  public static InvalidScopeType(): RoleException {
    return new RoleException(`Invalid scope type provided.`, 400);
  }

  public static UnauthorizedRoleAccess(roleId: string): RoleException {
    return new RoleException(
      `Unauthorized access to role with ID ${roleId}.`,
      403,
    );
  }
}
