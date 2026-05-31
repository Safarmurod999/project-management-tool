import { Inject } from '@nestjs/common';
import { ScopeType } from 'src/infrastructure/common/enum';
import { MembershipRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  UpdateTeamMemberRoleUsecase,
  UpdateTeamMemberRoleUsecaseParams,
} from './types';

export class UpdateTeamMemberRoleUsecaseImpl implements UpdateTeamMemberRoleUsecase {
  constructor(
    @Inject(RepositorySymbols.MembershipRepository)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(
    params: UpdateTeamMemberRoleUsecaseParams,
  ): Promise<import('src/domain').Membership> {
    const membership = await this.membershipRepository.update({
      id: params.membershipId,
      roleId: params.roleId,
    });

    if (
      membership.scopeType !== ScopeType.TEAM ||
      membership.scopeId !== params.teamId
    ) {
      throw new Error('Membership does not belong to the specified team.');
    }

    return membership;
  }
}
