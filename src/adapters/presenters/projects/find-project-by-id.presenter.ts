import { Project, ProjectStruct } from 'src/domain';

export interface FindProjectByIdPresenter {
  present(project: Project): ProjectStruct;
}

export class FindProjectByIdPresenterImpl implements FindProjectByIdPresenter {
  present(project: Project): ProjectStruct {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      teamId: project.teamId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      status: project.status,
    };
  }
}
