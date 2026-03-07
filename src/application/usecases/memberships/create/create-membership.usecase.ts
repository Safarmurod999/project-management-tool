import { Inject } from '@nestjs/common';
import { Membership, MembershipRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateMembershipUsecase, CreateMembershipUsecaseParams } from './types';

export class CreateMembershipUsecaseImpl implements CreateMembershipUsecase {
  constructor(
    @Inject(RepositorySymbols.MembershipRepository)
    private membershipRepository: MembershipRepository,
  ) {}

  async execute(params: CreateMembershipUsecaseParams): Promise<Membership> {
    return await this.membershipRepository.create({
      userId: params.userId,
      scopeType: params.scopeType,
      scopeId: params.scopeId,
      roleId: params.roleId,
    });
  }
}
