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

  public static UserAlreadyExists(email: string): UserException {
    return new UserException(`User with email ${email} already exists.`, 409);
  }

  public static UserAlreadyVerified(): UserException {
    return new UserException(`User is already verified.`, 409);
  }

  public static InvalidEmailFormat(): UserException {
    return new UserException(`Invalid email format.`, 400);
  }

  public static WeakPassword(): UserException {
    return new UserException(
      `Password must be at least 8 characters long and contain uppercase, lowercase, number and special character.`,
      400,
    );
  }

  public static AccountSuspended(): UserException {
    return new UserException(`User account is suspended.`, 403);
  }

  public static AccountDeactivated(): UserException {
    return new UserException(`User account is deactivated.`, 403);
  }
}
