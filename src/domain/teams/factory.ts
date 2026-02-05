import { Team } from "./entity";
import { User } from "../users";
import { Role } from "../roles";
import { Permission } from "../permissions";
import { TeamStatus, UserStatus } from "src/infrastructure/common/enum";
import { RoleStruct } from "../roles";

export interface TeamMemberStruct {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleStruct;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  status?: UserStatus;
}

export interface TeamStruct {
  id: string;
  name: string;
  description: string | null;
  members: TeamMemberStruct[];
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
    const members = data.members.map((m) => {
      const permissions = m.role.permissions.map(
        (p) =>
          new Permission(
            p.id,
            p.code,
            p.createdAt,
            p.updatedAt,
            p.status,
          ),
      );

      const role = new Role(
        m.role.id,
        m.role.name,
        permissions,
        m.role.createdAt,
        m.role.updatedAt,
        m.role.status,
      );

      return new User(
        m.id,
        m.email,
        m.password,
        m.name,
        role,
        m.isVerified,
        m.createdAt,
        m.updatedAt,
        m.status,
      );
    });

    return new Team(
      data.id,
      data.name,
      data.description,
      members,
      data.ownerId,
      data.createdAt,
      data.updatedAt,
      data.status,
    );
  }
}
