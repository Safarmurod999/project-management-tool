import { Permission } from "src/domain";

export interface GetPermissionsUsecaseParams {
  name?: string;
  page?: number;
  limit?: number;
}

export interface GetPermissionsUsecaseResult {
  data: Permission[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface GetPermissionsUsecase {
  execute(params: GetPermissionsUsecaseParams): Promise<GetPermissionsUsecaseResult>;
}
