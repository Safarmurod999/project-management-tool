import { Team } from "src/domain";
import { TeamDocument } from "../models";

export class TeamMapper {
  static toDomain(raw: TeamDocument): Team {
    return new Team(
      raw._id.toString(),
      raw.name,
      raw.description,
      raw.ownerId.toString(),
      raw.createdAt,
      raw.updatedAt,
      raw.status
    );
  }

  static toPersistence(team: Team): any {
    return {
      name: team.name,
      description: team.description,
      ownerId: team.ownerId,
      status: team.status,
      updatedAt: team.updatedAt,
    };
  }
}
