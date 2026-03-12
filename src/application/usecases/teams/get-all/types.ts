import { Team } from 'src/domain';

export interface GetTeamsUsecaseParams {
  name?: string;
  page?: number;
  limit?: number;
}

export interface GetTeamsUsecaseResult {
  data: Team[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface GetTeamsUsecase {
  execute(params: GetTeamsUsecaseParams): Promise<GetTeamsUsecaseResult>;
}
