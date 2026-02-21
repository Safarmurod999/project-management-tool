import { Role } from "src/domain";
import { RoleCode, RoleStatus } from "src/infrastructure/common/enum";

export interface UpdateRoleUsecaseParams {
  id: string;
  name: string;
  code: RoleCode;
  permissions: string[];
  description?: string;
  status?: RoleStatus;
}

export interface UpdateRoleUsecase {
  execute(params: UpdateRoleUsecaseParams): Promise<Role>;
}
