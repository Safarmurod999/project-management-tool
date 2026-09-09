export class CardException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'CardException';
    this.statusCode = statusCode;
  }

  static CardNotFound(id: string): CardException {
    return new CardException(`Card with ID ${id} not found.`, 404);
  }

  static InvalidTitle(): CardException {
    return new CardException('Card title is invalid.', 400);
  }

  static InvalidOrder(): CardException {
    return new CardException('Card order is invalid.', 400);
  }

  static InvalidPoints(): CardException {
    return new CardException('Card points must be zero or greater.', 400);
  }

  static InvalidColumnId(columnId: string): CardException {
    return new CardException(`Column with ID ${columnId} not found.`, 404);
  }

  static CardAlreadyExists(title: string, columnId: string): CardException {
    return new CardException(
      `Card with title "${title}" already exists in column ${columnId}.`,
      409,
    );
  }
}
