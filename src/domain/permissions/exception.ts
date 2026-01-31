export class PermissionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionException';
  }

  public static PermissionNotFound(permissionId: string): PermissionException {
    return new PermissionException(`Permission with ID ${permissionId} not found.`);
  }

  public static InvalidPermissionData(reason: string): PermissionException {
    return new PermissionException(`Invalid permission data: ${reason}`);
  }
}
