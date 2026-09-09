import { Inject } from '@nestjs/common';
import { Card, CardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindCardByIdUsecase, FindCardByIdUsecaseParams } from './types';

export class FindCardByIdUsecaseImpl implements FindCardByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(params: FindCardByIdUsecaseParams): Promise<Card> {
    return await this.cardRepository.findById(params.id);
  }
}
