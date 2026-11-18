import { Inject } from '@nestjs/common';
import { AssignedCardStats, CardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetMyCardStatsUsecase, GetMyCardStatsUsecaseParams } from './types';

export class GetMyCardStatsUsecaseImpl implements GetMyCardStatsUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(
    params: GetMyCardStatsUsecaseParams,
  ): Promise<AssignedCardStats> {
    return await this.cardRepository.getAssignedStats({
      assigneeId: params.userId,
      projectId: params.projectId || undefined,
    });
  }
}
