import { Inject } from '@nestjs/common';
import {
  BoardRepository,
  Card,
  CardException,
  CardRepository,
  ColumnRepository,
  ColumnStatusRepository,
  StatusRepository,
} from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CardStatusResolverDeps, resolveCardStatusId } from '../shared';
import { UpdateCardUsecase, UpdateCardUsecaseParams } from './types';

export class UpdateCardUsecaseImpl implements UpdateCardUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
    @Inject(RepositorySymbols.BoardRepository)
    private readonly boardRepository: BoardRepository,
    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,
    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,
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

    // Re-validate the status whenever the card changes column or status.
    let statusId: string | undefined;
    if (params.statusId || params.columnId) {
      statusId = await resolveCardStatusId(this.statusDeps, {
        columnId,
        requestedStatusId: params.statusId,
        currentStatusId: existingCard.statusId,
      });
    }

    return await this.cardRepository.update({
      id: params.id,
      columnId: params.columnId,
      title: params.title,
      description: params.description,
      order: params.order,
      statusId,
      assigneeId: params.assigneeId,
      assignerId: params.assignerId,
      points: params.points,
      version: params.version,
    });
  }

  private get statusDeps(): CardStatusResolverDeps {
    return {
      columnRepository: this.columnRepository,
      boardRepository: this.boardRepository,
      statusRepository: this.statusRepository,
      columnStatusRepository: this.columnStatusRepository,
    };
  }
}
