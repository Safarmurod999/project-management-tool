import { Inject } from '@nestjs/common';
import { Card, CardException, CardRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UpdateCardUsecase, UpdateCardUsecaseParams } from './types';

export class UpdateCardUsecaseImpl implements UpdateCardUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(params: UpdateCardUsecaseParams): Promise<Card> {
    const existingCard = await this.cardRepository.findById(params.id);
    const columnId = params.columnId ?? existingCard.columnId;
    const title = params.title ?? existingCard.title;

    if (params.title || params.columnId) {
      const duplicate = await this.cardRepository.find({
        columnId,
        title,
        page: 1,
        limit: 1,
      });

      if (
        duplicate.data.length > 0 &&
        duplicate.data[0].id !== existingCard.id
      ) {
        throw CardException.CardAlreadyExists(title, columnId);
      }
    }

    return await this.cardRepository.update({
      id: params.id,
      columnId: params.columnId,
      title: params.title,
      description: params.description,
      order: params.order,
      status: params.status,
      assigneeId: params.assigneeId,
      assignerId: params.assignerId,
      points: params.points,
      version: params.version,
    });
  }
}
