import { Inject } from '@nestjs/common';
import {
  BoardRepository,
  Card,
  CardRepository,
  ColumnRepository,
  ColumnStatusRepository,
  StatusRepository,
} from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CardStatusResolverDeps, resolveCardStatusId } from '../shared';
import { CreateCardUsecase, CreateCardUsecaseParams } from './types';

export class CreateCardUsecaseImpl implements CreateCardUsecase {
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

  async execute(params: CreateCardUsecaseParams): Promise<Card> {
    const statusId = await resolveCardStatusId(this.statusDeps, {
      columnId: params.columnId,
      requestedStatusId: params.statusId,
    });

    return await this.cardRepository.create({
      columnId: params.columnId,
      title: params.title,
      description: params.description ?? null,
      order: params.order ?? 0,
      statusId,
      assigneeId: params.assigneeId ?? null,
      assignerId: params.assignerId ?? null,
      points: params.points ?? 0,
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
