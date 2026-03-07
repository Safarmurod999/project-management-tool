import { Team } from "./entity";
import { TeamStatus } from "src/infrastructure/common/enum";

export interface TeamStruct {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date | null;
  status?: TeamStatus;
}

export interface TeamFactory {
  create(data: TeamStruct): Team;
}

export class TeamFactoryImpl implements TeamFactory {
  create(data: TeamStruct): Team {
    return new Team(
      data.id,
      data.name,
      data.description,
      data.ownerId,
      data.createdAt,
      data.updatedAt,
      data.status,
    );
  }
}
