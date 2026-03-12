import { Inject } from '@nestjs/common';
import { MembershipRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  GetMembershipsUsecase,
  GetMembershipsUsecaseParams,
  GetMembershipsUsecaseResult,
} from './types';

export class GetMembershipsUsecaseImpl implements GetMembershipsUsecase {
  constructor(
    @Inject(RepositorySymbols.MembershipRepository)
    private membershipRepository: MembershipRepository,
  ) {}

  async execute(
    params: GetMembershipsUsecaseParams,
  ): Promise<GetMembershipsUsecaseResult> {
    return await this.membershipRepository.find(params);
  }
}
