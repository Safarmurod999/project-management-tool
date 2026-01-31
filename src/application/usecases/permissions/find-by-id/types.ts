import { Permission } from "src/domain";

export interface FindPermissionByIdUsecaseParams {
  id: string;
}

export interface FindPermissionByIdUsecase {
  execute(params: FindPermissionByIdUsecaseParams): Promise<Permission>;
}
