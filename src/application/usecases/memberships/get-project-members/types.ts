import { MembershipDetails } from 'src/domain';

export interface GetProjectMembersUsecaseParams {
  projectId: string;
  page?: number;
  limit?: number;
}

export interface GetProjectMembersUsecaseResult {
  data: MembershipDetails[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface GetProjectMembersUsecase {
  execute(params: GetProjectMembersUsecaseParams): Promise<GetProjectMembersUsecaseResult>;
}
