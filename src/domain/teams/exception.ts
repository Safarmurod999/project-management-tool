export class TeamException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "TeamException";
    this.statusCode = statusCode;
  }

  public static TeamNotFound(teamId: string): TeamException {
    return new TeamException(`Team with ID ${teamId} not found.`, 404);
  }

  public static InvalidTeamData(reason: string): TeamException {
    return new TeamException(`Invalid team data: ${reason}`, 400);
  }

  public static UnauthorizedAccess(action: string): TeamException {
    return new TeamException(
      `Unauthorized access attempt to ${action}.`,
      401,
    );
  }

  public static UserNotInTeam(userId: string, teamId: string): TeamException {
    return new TeamException(
      `User with ID ${userId} is not a member of team ${teamId}.`,
      403,
    );
  }

  public static TeamAlreadyArchived(teamId: string): TeamException {
    return new TeamException(
      `Team with ID ${teamId} is already archived.`,
      409,
    );
  }
}
