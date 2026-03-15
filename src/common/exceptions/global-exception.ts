export class GlobalException extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;

  constructor(message: string, statusCode: number = 500, errorCode?: string) {
    super(message);
    this.name = 'GlobalException';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }

  public static InternalServerError(message: string = 'Internal server error'): GlobalException {
    return new GlobalException(message, 500, 'INTERNAL_SERVER_ERROR');
  }

  public static BadRequest(message: string): GlobalException {
    return new GlobalException(message, 400, 'BAD_REQUEST');
  }

  public static Unauthorized(message: string = 'Unauthorized'): GlobalException {
    return new GlobalException(message, 401, 'UNAUTHORIZED');
  }

  public static Forbidden(message: string = 'Forbidden'): GlobalException {
    return new GlobalException(message, 403, 'FORBIDDEN');
  }

  public static NotFound(message: string): GlobalException {
    return new GlobalException(message, 404, 'NOT_FOUND');
  }

  public static Conflict(message: string): GlobalException {
    return new GlobalException(message, 409, 'CONFLICT');
  }

  public static ValidationError(message: string): GlobalException {
    return new GlobalException(message, 422, 'VALIDATION_ERROR');
  }

  public static DatabaseError(message: string = 'Database operation failed'): GlobalException {
    return new GlobalException(message, 500, 'DATABASE_ERROR');
  }

  public static ExternalServiceError(message: string = 'External service error'): GlobalException {
    return new GlobalException(message, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}