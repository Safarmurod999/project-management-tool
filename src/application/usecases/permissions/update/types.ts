import { Permission } from "src/domain";

export interface UpdatePermissionUsecaseParams {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdatePermissionUsecase {
  execute(params: UpdatePermissionUsecaseParams): Promise<Permission>;
}
