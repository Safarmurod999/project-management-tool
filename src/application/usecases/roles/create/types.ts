import { Role } from "src/domain";

export interface CreateRoleUsecaseParams {
  name: string;
  permissions: string[];
  description: string;
  isActive?: boolean;
}

export interface CreateRoleUsecase {
  execute(params: CreateRoleUsecaseParams): Promise<Role>;
}
