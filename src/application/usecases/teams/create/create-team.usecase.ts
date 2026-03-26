import { Inject } from '@nestjs/common';
import { MembershipRepository, Team, TeamRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateTeamUsecase, CreateTeamUsecaseParams } from './types';
import { ScopeType } from 'src/infrastructure/common/enum';

export class CreateTeamUsecaseImpl implements CreateTeamUsecase {
  constructor(
    @Inject(RepositorySymbols.TeamRepository)
    private teamRepository: TeamRepository,

    @Inject(RepositorySymbols.MembershipRepository)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(params: CreateTeamUsecaseParams): Promise<Team> {
    const team = {
      name: params.name,
      description: params.description,
      ownerId: params.ownerId,
      status: params.status,
      roleId: params.roleId,
    };

    const teamData = await this.teamRepository.create(team)

    await this.membershipRepository.create({
      userId: String(teamData.ownerId),
      scopeType: ScopeType.TEAM,
      scopeId: teamData.id,
      roleId: team.roleId,
      override: true,
    });

    return teamData;
  }
}
