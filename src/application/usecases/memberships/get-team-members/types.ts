import { Membership } from 'src/domain';

export interface GetTeamMembersUsecaseParams {
  teamId: string;
  page?: number;
  limit?: number;
}

export interface GetTeamMembersUsecaseResult {
  data: Membership[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface GetTeamMembersUsecase {
  execute(params: GetTeamMembersUsecaseParams): Promise<GetTeamMembersUsecaseResult>;
}
