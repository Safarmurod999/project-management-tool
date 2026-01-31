import { Permission, Role } from "src/domain";
import { PermissionDocument, RoleDocument } from "../models";
import { PermissionMapper } from "./permissions.mapper";

export class RoleMapper {
  static toDomain(raw: RoleDocument): Role {
    const permissions: Permission[] = [];

    if (raw.permissions && Array.isArray(raw.permissions)) {
      for (const perm of raw.permissions) {
        if (typeof perm === 'object' && perm !== null) {
          permissions.push(PermissionMapper.toDomain(perm as unknown as PermissionDocument));
        }
      }
    }

    return new Role(
      raw._id.toString(),
      raw.name,
      permissions,
      raw.createdAt,
      raw.updatedAt,
      raw.description,
      raw.isActive,
    );
  }

  static toPersistence(role: Role): any {
    return {
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(perm => perm.id),
      isActive: role.isActive,
    };
  }
}
