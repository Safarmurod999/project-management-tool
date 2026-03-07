import { Inject } from '@nestjs/common';
import { Membership, MembershipRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UpdateMembershipUsecase, UpdateMembershipUsecaseParams } from './types';

export class UpdateMembershipUsecaseImpl implements UpdateMembershipUsecase {
  constructor(
    @Inject(RepositorySymbols.MembershipRepository)
    private membershipRepository: MembershipRepository,
  ) {}

  async execute(params: UpdateMembershipUsecaseParams): Promise<Membership> {
    return await this.membershipRepository.update({
      id: params.id,
      userId: params.userId,
      scopeType: params.scopeType,
      scopeId: params.scopeId,
      roleId: params.roleId,
    });
  }
}
