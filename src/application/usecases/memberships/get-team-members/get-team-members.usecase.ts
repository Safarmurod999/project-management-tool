import { Inject } from '@nestjs/common';
import { MembershipRepository } from 'src/domain';
import { ScopeType } from 'src/infrastructure/common/enum';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  GetTeamMembersUsecase,
  GetTeamMembersUsecaseParams,
  GetTeamMembersUsecaseResult,
} from './types';

export class GetTeamMembersUsecaseImpl implements GetTeamMembersUsecase {
  constructor(
    @Inject(RepositorySymbols.MembershipRepository)
    private membershipRepository: MembershipRepository,
  ) {}

  async execute(
    params: GetTeamMembersUsecaseParams,
  ): Promise<GetTeamMembersUsecaseResult> {
    return await this.membershipRepository.find({
      scopeType: ScopeType.TEAM,
      scopeId: params.teamId,
      page: params.page,
      limit: params.limit,
    });
  }
}
