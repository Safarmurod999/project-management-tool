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

  public static InvalidMembershipData(reason: string): MembershipException {
    return new MembershipException(`Invalid membership data: ${reason}`, 400);
  }

  public static UserAlreadyMember(userId: string, teamId: string): MembershipException {
    return new MembershipException(
      `User ${userId} is already a member of team ${teamId}.`,
      409,
    );
  }

  public static CannotRemoveLastOwner(teamId: string): MembershipException {
    return new MembershipException(
      `Cannot remove the last owner from team ${teamId}.`,
      409,
    );
  }

  public static UserNotMember(userId: string, teamId: string): MembershipException {
    return new MembershipException(
      `User ${userId} is not a member of team ${teamId}.`,
      404,
    );
  }

  public static TeamNotFound(teamId: string): MembershipException {
    return new MembershipException(`Team with ID ${teamId} not found.`, 404);
  }

  public static RoleNotFound(roleId: string): MembershipException {
    return new MembershipException(`Role with ID ${roleId} not found.`, 404);
  }

  public static UnauthorizedMembershipAccess(membershipId: string): MembershipException {
    return new MembershipException(
      `Unauthorized access to membership with ID ${membershipId}.`,
      403,
    );
  }
}
