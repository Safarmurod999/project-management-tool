import { Inject } from '@nestjs/common';
import { Project, ProjectRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateProjectUsecase, CreateProjectUsecaseParams } from './types';

export class CreateProjectUsecaseImpl implements CreateProjectUsecase {
  constructor(
    @Inject(RepositorySymbols.ProjectRepository)
    private projectRepository: ProjectRepository,
  ) {}

  async execute(params: CreateProjectUsecaseParams): Promise<Project> {
    const project = {
      name: params.name,
      description: params.description,
      teamId: params.teamId,
      status: params.status,
    };

    return await this.projectRepository.create(project);
  }
}
