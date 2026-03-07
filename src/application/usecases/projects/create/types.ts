import { Project } from 'src/domain';
import { ProjectStatus } from 'src/infrastructure/common/enum';

export interface CreateProjectUsecaseParams {
  name: string;
  description: string | null;
  teamId: string;
  status?: ProjectStatus;
}

export interface CreateProjectUsecase {
  execute(params: CreateProjectUsecaseParams): Promise<Project>;
}
