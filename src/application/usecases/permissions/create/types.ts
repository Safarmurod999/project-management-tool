import { Permission } from "src/domain";

export interface CreatePermissionUsecaseParams {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface CreatePermissionUsecase {
  execute(params: CreatePermissionUsecaseParams): Promise<Permission>;
}
