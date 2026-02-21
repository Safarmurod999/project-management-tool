import { Role } from "src/domain";
import { RoleDocument } from "../models";

export class RoleMapper {
  static toDomain(raw: RoleDocument): Role {
    return new Role(
      raw._id.toString(),
      raw.name,
      raw.code,
      raw.createdAt,
      raw.updatedAt,
      raw.description,
      raw.status,
    );
  }

  static toPersistence(role: Role): any {
    return {
      name: role.name,
      code: role.code,
      description: role.description,
      status: role.status,
    };
  }
}
