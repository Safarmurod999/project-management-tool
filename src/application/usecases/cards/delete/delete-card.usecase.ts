import { Inject } from '@nestjs/common';
import { CardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { DeleteCardUsecase, DeleteCardUsecaseParams } from './types';

export class DeleteCardUsecaseImpl implements DeleteCardUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(params: DeleteCardUsecaseParams): Promise<string> {
    await this.cardRepository.findById(params.id);
    return await this.cardRepository.delete(params.id);
  }
}
