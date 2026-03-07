import { Inject } from '@nestjs/common';
import { Project, ProjectRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindProjectByIdUsecase, FindProjectByIdUsecaseParams } from './types';

export class FindProjectByIdUsecaseImpl implements FindProjectByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.ProjectRepository)
    private projectRepository: ProjectRepository,
  ) {}

  async execute(params: FindProjectByIdUsecaseParams): Promise<Project> {
    return await this.projectRepository.findById(params.id);
  }
}
