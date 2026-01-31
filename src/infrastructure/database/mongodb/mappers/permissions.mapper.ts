import { Permission } from "src/domain";
import { PermissionDocument } from "../models";

export class PermissionMapper {
  static toDomain(raw: PermissionDocument): Permission {
    return new Permission(
      raw._id.toString(),
      raw.code,
      raw.createdAt,
      raw.updatedAt,
      raw.status,
    );
  }

  static toPersistence(permission: Permission): any {
    return {
      code: permission.code,
      status: permission.status,
    };
  }
}