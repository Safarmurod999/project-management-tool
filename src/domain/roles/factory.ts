import { Permission, PermissionStruct } from "../permissions";
import { Role } from "./entity";

export interface RoleStruct {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionStruct[];
  createdAt: Date;
  updatedAt: Date | null;
  isActive?: boolean;
}

export interface RoleFactory {
  create(data: RoleStruct): Role;
}

export class RoleFactoryImpl implements RoleFactory {
  create(data: RoleStruct): Role {
    const permissions = data.permissions.map(p => new Permission(
      p.id,
      p.name,
      p.description,
      p.createdAt,
      p.updatedAt,
      p.isActive,
    ))
    return new Role(
      data.id,
      data.name,
      permissions,
      data.createdAt,
      data.updatedAt,
      data.description,
      data.isActive
    );
  }
}
