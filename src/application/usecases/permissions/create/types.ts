import { Permission } from "src/domain";
import { PermissionCode, PermissionStatus } from "src/infrastructure/common/enum";

export interface CreatePermissionUsecaseParams {
  code: PermissionCode;
  status?: PermissionStatus;
}

export interface CreatePermissionUsecase {
  execute(params: CreatePermissionUsecaseParams): Promise<Permission>;
}
