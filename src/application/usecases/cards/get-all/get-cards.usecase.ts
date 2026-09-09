import { Inject } from '@nestjs/common';
import { CardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetCardsUsecase, GetCardsUsecaseParams } from './types';

export class GetCardsUsecaseImpl implements GetCardsUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(params: GetCardsUsecaseParams) {
    return await this.cardRepository.find(params);
  }
}
