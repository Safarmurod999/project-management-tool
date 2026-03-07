import { Project, ProjectStruct } from 'src/domain';

export interface GetProjectsPresenter {
  present(projects: Project[]): ProjectStruct[];
}

export class GetProjectsPresenterImpl implements GetProjectsPresenter {
  present(projects: Project[]): ProjectStruct[] {
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      teamId: project.teamId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      status: project.status,
    }));
  }
}
