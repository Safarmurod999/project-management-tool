import { Inject } from '@nestjs/common';
import { Card, CardException, CardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ReorderCardUsecase, ReorderCardUsecaseParams } from './types';

export class ReorderCardUsecaseImpl implements ReorderCardUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(params: ReorderCardUsecaseParams): Promise<Card> {
    if (params.newIndex < 0) {
      throw CardException.InvalidOrder();
    }

    return await this.cardRepository.reorder({
      cardId: params.cardId,
      sourceColumnId: params.sourceColumnId,
      targetColumnId: params.targetColumnId,
      newIndex: params.newIndex,
      status: params.status,
    });
  }
}
