export class UserException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserException';
  }

  public static UserNotFound(userId: string): UserException {
    return new UserException(`User with ID ${userId} not found.`);
  }

  public static InvalidUserData(reason: string): UserException {
    return new UserException(`Invalid user data: ${reason}`);
  }

  public static UnauthorizedAccess(action: string): UserException {
    return new UserException(`Unauthorized access attempt to ${action}.`);
  }
}
