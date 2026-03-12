import { Inject } from '@nestjs/common';
import { Team, TeamRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateTeamUsecase, CreateTeamUsecaseParams } from './types';

export class CreateTeamUsecaseImpl implements CreateTeamUsecase {
  constructor(
    @Inject(RepositorySymbols.TeamRepository)
    private teamRepository: TeamRepository,
  ) {}

  async execute(params: CreateTeamUsecaseParams): Promise<Team> {
    const team = {
      name: params.name,
      description: params.description,
      ownerId: params.ownerId,
      status: params.status,
    };

    return await this.teamRepository.create(team);
  }
}
