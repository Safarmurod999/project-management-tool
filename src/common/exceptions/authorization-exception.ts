export class AuthorizationException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthorizationException';
    this.statusCode = statusCode;
  }

  public static Unauthorized(action: string): AuthorizationException {
    return new AuthorizationException(
      `Unauthorized access attempt to ${action}.`,
      401,
    );
  }

  public static Forbidden(action: string): AuthorizationException {
    return new AuthorizationException(`Forbidden action: ${action}.`, 403);
  }
}
