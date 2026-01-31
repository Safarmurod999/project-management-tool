import { Role } from "src/domain";
import { RoleCode, RoleStatus } from "src/infrastructure/common/enum";

export interface CreateRoleUsecaseParams {
  name: RoleCode;
  permissions: string[];
  description: string;
  status?: RoleStatus;
}

export interface CreateRoleUsecase {
  execute(params: CreateRoleUsecaseParams): Promise<Role>;
}
