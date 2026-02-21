import { Team } from "src/domain";
import { TeamDocument, UserDocument } from "../models";
import { UserMapper } from "./user.mapper";

export class TeamMapper {
  static toDomain(raw: TeamDocument): Team {
    if (!Array.isArray(raw.members)) {
      throw new Error("Members should be populated");
    }

    const members = raw.members.map((m) => UserMapper.toDomain(m as unknown as UserDocument));

    return new Team(
      raw._id.toString(),
      raw.name,
      raw.description,
      members,
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
      members: team.members.map((m) => m.id),
      ownerId: team.ownerId,
      status: team.status,
      updatedAt: team.updatedAt,
    };
  }
}
