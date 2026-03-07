import { Inject } from '@nestjs/common';
import { MembershipRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { DeleteMembershipUsecase, DeleteMembershipUsecaseParams } from './types';

export class DeleteMembershipUsecaseImpl implements DeleteMembershipUsecase {
  constructor(
    @Inject(RepositorySymbols.MembershipRepository)
    private membershipRepository: MembershipRepository,
  ) {}

  async execute(params: DeleteMembershipUsecaseParams): Promise<string> {
    return await this.membershipRepository.delete(params.id);
  }
}
