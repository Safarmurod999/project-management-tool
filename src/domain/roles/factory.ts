import { RoleCode, RoleStatus } from "src/infrastructure/common/enum";
import { Permission, PermissionStruct } from "../permissions";
import { Role } from "./entity";

export interface RoleStruct {
  id: string;
  name: RoleCode;
  description?: string;
  permissions: PermissionStruct[];
  createdAt: Date;
  updatedAt: Date | null;
  status?: RoleStatus;
}

export interface RoleFactory {
  create(data: RoleStruct): Role;
}

export class RoleFactoryImpl implements RoleFactory {
  create(data: RoleStruct): Role {
    const permissions = data.permissions.map(p => new Permission(
      p.id,
      p.code,
      p.createdAt,
      p.updatedAt,
      p.status,
    ))
    return new Role(
      data.id,
      data.name,
      permissions,
      data.createdAt,
      data.updatedAt,
      data.description,
      data.status
    );
  }
}
