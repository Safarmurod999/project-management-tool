import { Project } from 'src/domain';

export interface GetProjectsUsecaseParams {
  name?: string;
  page?: number;
  limit?: number;
}

export interface GetProjectsUsecaseResult {
  data: Project[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface GetProjectsUsecase {
  execute(params: GetProjectsUsecaseParams): Promise<GetProjectsUsecaseResult>;
}
