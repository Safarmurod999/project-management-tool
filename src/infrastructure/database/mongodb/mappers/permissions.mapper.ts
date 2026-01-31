import { Permission } from "src/domain";
import { PermissionDocument } from "../models";

export class PermissionMapper {
  static toDomain(raw: PermissionDocument): Permission {
    return new Permission(
      raw._id.toString(),
      raw.name,
      raw.description,
      raw.createdAt,
      raw.updatedAt,
      raw.isActive,
    );
  }

  static toPersistence(permission: Permission): any {
    return {
      name: permission.name,
      description: permission.description,
      isActive: permission.isActive,
    };
  }
}