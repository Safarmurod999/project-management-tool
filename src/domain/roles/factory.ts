import { RoleCode, RoleStatus } from "src/infrastructure/common/enum";
import { Role } from "./entity";

export interface RoleStruct {
  id: string;
  name: string;
  code: RoleCode;
  description?: string;
  createdAt: Date;
  updatedAt: Date | null;
  status?: RoleStatus;
}

export interface RoleFactory {
  create(data: RoleStruct): Role;
}

export class RoleFactoryImpl implements RoleFactory {
  create(data: RoleStruct): Role {
    return new Role(
      data.id,
      data.name,
      data.code,
      data.createdAt,
      data.updatedAt,
      data.description,
      data.status
    );
  }
}
