import { Role } from "src/domain";

export interface UpdateRoleUsecaseParams {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  isActive?: boolean;
}

export interface UpdateRoleUsecase {
  execute(params: UpdateRoleUsecaseParams): Promise<Role>;
}
