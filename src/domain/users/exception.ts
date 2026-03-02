export class UserException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'UserException';
    this.statusCode = statusCode;
  }

  public static UserNotFound(userId: string): UserException {
    return new UserException(`User with ID ${userId} not found.`, 404);
  }

  public static InvalidUserData(reason: string): UserException {
    return new UserException(`Invalid user data: ${reason}`, 400);
  }

  public static IncorrectPassword(): UserException {
    return new UserException(`The provided password is incorrect.`, 401);
  }

  public static UnverifiedUser(): UserException {
    return new UserException(`User email is not verified.`, 403);
  }
}
