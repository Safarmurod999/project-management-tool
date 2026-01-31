export class RoleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoleException';
  }

  public static RoleNotFound(roleId: string): RoleException {
    return new RoleException(`Role with ID ${roleId} not found.`);
  }

  public static InvalidRoleData(reason: string): RoleException {
    return new RoleException(`Invalid role data: ${reason}`);
  }
}
