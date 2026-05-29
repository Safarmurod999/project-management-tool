import { Inject } from '@nestjs/common';
import { MembershipRepository } from 'src/domain';
import { ScopeType } from 'src/infrastructure/common/enum';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  GetProjectMembersUsecase,
  GetProjectMembersUsecaseParams,
  GetProjectMembersUsecaseResult,
} from './types';

export class GetProjectMembersUsecaseImpl implements GetProjectMembersUsecase {
  constructor(
    @Inject(RepositorySymbols.MembershipRepository)
    private membershipRepository: MembershipRepository,
  ) {}

  async execute(
    params: GetProjectMembersUsecaseParams,
  ): Promise<GetProjectMembersUsecaseResult> {
    const members = await this.membershipRepository.findAndPopulate({
      scopeType: ScopeType.PROJECT,
      scopeId: params.projectId,
      page: params.page,
      limit: params.limit,
    });

    return members;
  }
}
