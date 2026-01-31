import { Permission } from "src/domain";
import { PermissionCode, PermissionStatus } from "src/infrastructure/common/enum";

export interface UpdatePermissionUsecaseParams {
  id: string;
  code: PermissionCode;
  status?: PermissionStatus;
}

export interface UpdatePermissionUsecase {
  execute(params: UpdatePermissionUsecaseParams): Promise<Permission>;
}
