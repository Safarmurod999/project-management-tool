import { Inject } from '@nestjs/common';
import { TeamRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { DeleteTeamUsecase, DeleteTeamUsecaseParams } from './types';

export class DeleteTeamUsecaseImpl implements DeleteTeamUsecase {
  constructor(
    @Inject(RepositorySymbols.TeamRepository)
    private teamRepository: TeamRepository,
  ) {}

  async execute(params: DeleteTeamUsecaseParams): Promise<string> {
    return await this.teamRepository.delete(params.id);
  }
}
