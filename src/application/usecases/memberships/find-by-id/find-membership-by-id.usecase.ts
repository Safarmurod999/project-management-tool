import { Inject } from '@nestjs/common';
import { Membership, MembershipRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  FindMembershipByIdUsecase,
  FindMembershipByIdUsecaseParams,
} from './types';

export class FindMembershipByIdUsecaseImpl implements FindMembershipByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.MembershipRepository)
    private membershipRepository: MembershipRepository,
  ) {}

  async execute(params: FindMembershipByIdUsecaseParams): Promise<Membership> {
    return await this.membershipRepository.findById(params.id);
  }
}
