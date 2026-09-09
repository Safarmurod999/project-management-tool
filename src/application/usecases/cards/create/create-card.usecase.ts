import { Inject } from '@nestjs/common';
import { Card, CardRepository } from 'src/domain';
import { CardStatus } from 'src/infrastructure/common/enum';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateCardUsecase, CreateCardUsecaseParams } from './types';

export class CreateCardUsecaseImpl implements CreateCardUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(params: CreateCardUsecaseParams): Promise<Card> {
    return await this.cardRepository.create({
      columnId: params.columnId,
      title: params.title,
      description: params.description ?? null,
      order: params.order ?? 0,
      status: params.status ?? CardStatus.TODO,
      assigneeId: params.assigneeId ?? null,
      assignerId: params.assignerId ?? null,
      points: params.points ?? 0,
    });
  }
}
