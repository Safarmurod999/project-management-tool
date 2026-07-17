import { Inject } from '@nestjs/common';
import { Team, TeamRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UpdateTeamUsecase, UpdateTeamUsecaseParams } from './types';

export class UpdateTeamUsecaseImpl implements UpdateTeamUsecase {
  constructor(
    @Inject(RepositorySymbols.TeamRepository)
    private teamRepository: TeamRepository,
  ) {}

  async execute(params: UpdateTeamUsecaseParams): Promise<Team> {
    const team = {
      id: params.id,
      name: params.name,
      description: params.description,
      ownerId: params.ownerId,
      status: params.status,
    };

    return await this.teamRepository.update(team);
  }
}
