import { Inject } from '@nestjs/common';
import { ProjectRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  GetProjectsUsecase,
  GetProjectsUsecaseParams,
  GetProjectsUsecaseResult,
} from './types';

export class GetProjectsUsecaseImpl implements GetProjectsUsecase {
  constructor(
    @Inject(RepositorySymbols.ProjectRepository)
    private projectRepository: ProjectRepository,
  ) {}

  async execute(
    params: GetProjectsUsecaseParams,
  ): Promise<GetProjectsUsecaseResult> {
    return await this.projectRepository.find(params);
  }
}
