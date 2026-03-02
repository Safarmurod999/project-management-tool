import { Project } from 'src/domain';
import { ProjectDocument } from '../models';

export class ProjectMapper {
  static toDomain(raw: ProjectDocument): Project {
    return new Project(
      raw._id.toString(),
      raw.name,
      raw.description,
      raw.teamId.toString(),
      raw.createdAt,
      raw.updatedAt,
      raw.status,
    );
  }

  static toPersistence(project: Project): any {
    return {
      name: project.name,
      description: project.description,
      teamId: project.teamId,
      status: project.status,
      updatedAt: project.updatedAt,
    };
  }
}
