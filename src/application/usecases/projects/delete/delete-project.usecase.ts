import { Inject } from '@nestjs/common';
import { ProjectRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { DeleteProjectUsecase, DeleteProjectUsecaseParams } from './types';

export class DeleteProjectUsecaseImpl implements DeleteProjectUsecase {
  constructor(
    @Inject(RepositorySymbols.ProjectRepository)
    private projectRepository: ProjectRepository,
  ) {}

  async execute(params: DeleteProjectUsecaseParams): Promise<string> {
    return await this.projectRepository.delete(params.id);
  }
}
