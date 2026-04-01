import { Project } from 'src/domain';

export interface GetProjectsUsecaseParams {
  userId: string;
  name?: string;
}

export interface GetProjectsUsecaseResult {
  myProjects: Project[];
  participatedProjects: Project[];
}

export interface GetProjectsUsecase {
  execute(params: GetProjectsUsecaseParams): Promise<GetProjectsUsecaseResult>;
}
