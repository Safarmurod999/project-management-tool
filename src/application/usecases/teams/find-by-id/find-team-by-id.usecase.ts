import { Inject } from '@nestjs/common';
import { Team, TeamRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindTeamByIdUsecase, FindTeamByIdUsecaseParams } from './types';

export class FindTeamByIdUsecaseImpl implements FindTeamByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.TeamRepository)
    private teamRepository: TeamRepository,
  ) {}

  async execute(params: FindTeamByIdUsecaseParams): Promise<Team> {
    return await this.teamRepository.findById(params.id);
  }
}
