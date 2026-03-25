import { Inject } from '@nestjs/common';
import { MembershipRepository, RoleRepository, UserRepository } from 'src/domain';
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

    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,

    @Inject(RepositorySymbols.RoleRepository)
    private roleRepository: RoleRepository
  ) {}

  async execute(
    params: GetTeamMembersUsecaseParams,
  ): Promise<GetTeamMembersUsecaseResult> {
    const members = await this.membershipRepository.find({
      scopeType: ScopeType.TEAM,
      scopeId: params.teamId,
      page: params.page,
      limit: params.limit,
    });


    let mappedMembers;

    if (members?.data?.length) {
      const users = await this.userRepository.find({});
      const roles = await this.roleRepository.find({});

      mappedMembers = members.data.map(member=>{
        return {
          ...member,
          user: users.data.find(el=>el.id === member.userId),
          role: roles.data.find(el=>el.id === member.roleId),
        }
      })
    }
        
    return {
      ...members,
      data: mappedMembers
    }
  }
}
