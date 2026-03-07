import { Inject } from '@nestjs/common';
import { Project, ProjectRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UpdateProjectUsecase, UpdateProjectUsecaseParams } from './types';

export class UpdateProjectUsecaseImpl implements UpdateProjectUsecase {
  constructor(
    @Inject(RepositorySymbols.ProjectRepository)
    private projectRepository: ProjectRepository,
  ) {}

  async execute(params: UpdateProjectUsecaseParams): Promise<Project> {
    const project = {
      id: params.id,
      name: params.name,
      description: params.description,
      teamId: params.teamId,
      status: params.status,
    };

    return await this.projectRepository.update(project);
  }
}
