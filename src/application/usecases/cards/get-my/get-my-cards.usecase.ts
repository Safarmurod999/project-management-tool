import { Inject } from '@nestjs/common';
import { AssignedCardGetResponse, CardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { normalizePagination } from '../../shared';
import { GetMyCardsUsecase, GetMyCardsUsecaseParams } from './types';

export class GetMyCardsUsecaseImpl implements GetMyCardsUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(
    params: GetMyCardsUsecaseParams,
  ): Promise<AssignedCardGetResponse> {
    const { page, limit } = normalizePagination(params);

    return await this.cardRepository.findAssignedTo({
      assigneeId: params.userId,
      page,
      limit,
      projectId: params.projectId || undefined,
      statusId: params.statusId || undefined,
      title: params.title?.trim() || undefined,
      done: params.done,
    });
  }
}
