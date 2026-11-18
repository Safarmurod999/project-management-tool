export class NotificationException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'NotificationException';
    this.statusCode = statusCode;
  }

  static NotificationNotFound(id: string): NotificationException {
    return new NotificationException(
      `Notification with ID ${id} not found.`,
      404,
    );
  }

  static InvalidRecipient(): NotificationException {
    return new NotificationException(
      'Notification recipient is required.',
      400,
    );
  }

  static InvalidUnreadFilter(value: string): NotificationException {
    return new NotificationException(
      `unread must be "true" or "false", got "${value}".`,
      400,
    );
  }

  static InvalidTitle(): NotificationException {
    return new NotificationException('Notification title is invalid.', 400);
  }
}
