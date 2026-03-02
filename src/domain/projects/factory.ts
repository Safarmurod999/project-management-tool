import { Project } from './entity';
import { ProjectStatus } from 'src/infrastructure/common/enum';

export interface ProjectStruct {
  id: string;
  name: string;
  description: string | null;
  teamId: string;
  createdAt: Date;
  updatedAt: Date | null;
  status?: ProjectStatus;
}

export interface ProjectFactory {
  create(data: ProjectStruct): Project;
}

export class ProjectFactoryImpl implements ProjectFactory {
  create(data: ProjectStruct): Project {
    return new Project(
      data.id,
      data.name,
      data.description,
      data.teamId,
      data.createdAt,
      data.updatedAt,
      data.status,
    );
  }
}
