import { Role } from "src/domain";

export interface GetRolesUsecaseParams {
  name?: string;
  page?: number;
  limit?: number;
}

export interface GetRolesUsecaseResult {
  data: Role[];
  totalCount: number;
}

export interface GetRolesUsecase {
  execute(params: GetRolesUsecaseParams): Promise<GetRolesUsecaseResult>;
}
