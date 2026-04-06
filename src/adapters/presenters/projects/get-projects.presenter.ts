import { Project, ProjectStruct } from 'src/domain';

export interface GroupedProjects {
  myProjects: Project[];
  participatedProjects: Project[];
}

export interface GroupedProjectStruct {
  myProjects: ProjectStruct[];
  participatedProjects: ProjectStruct[];
}

export interface GetProjectsPresenter {
  present(projects: Project[]): ProjectStruct[];
  presentGrouped(projects: GroupedProjects): GroupedProjectStruct;
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

  presentGrouped(projects: GroupedProjects): GroupedProjectStruct {
    return {
      myProjects: this.present(projects.myProjects),
      participatedProjects: this.present(projects.participatedProjects),
    };
  }
}
