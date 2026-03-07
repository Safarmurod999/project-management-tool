export class MembershipException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'MembershipException';
    this.statusCode = statusCode;
  }

  public static MembershipNotFound(id: string): MembershipException {
    return new MembershipException(`Membership with ID ${id} not found.`, 404);
  }
}
