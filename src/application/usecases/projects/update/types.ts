import { Project } from 'src/domain';
import { ProjectStatus } from 'src/infrastructure/common/enum';

export interface UpdateProjectUsecaseParams {
  id: string;
  name?: string;
  description?: string | null;
  teamId?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectUsecase {
  execute(params: UpdateProjectUsecaseParams): Promise<Project>;
}
