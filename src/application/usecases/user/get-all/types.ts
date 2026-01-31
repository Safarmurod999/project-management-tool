import { User } from "src/domain";

export interface GetUsersUsecaseParams {
  name?: string;
  page?: number;
  limit?: number;
}

export interface GetUsersUsecaseResult {
  data: User[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface GetUsersUsecase {
  execute(params: GetUsersUsecaseParams): Promise<GetUsersUsecaseResult>;
}
