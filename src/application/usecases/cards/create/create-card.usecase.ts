import { Inject } from '@nestjs/common';
import {
  BoardRepository,
  Card,
  CardRepository,
  ColumnRepository,
  ColumnStatusRepository,
  StatusRepository,
  WorkflowRepository,
  WorkflowStatusRepository,
  WorkflowTransitionRepository,
} from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { NotifyCardChangeUsecase } from '../notify-change';
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
    @Inject(RepositorySymbols.WorkflowRepository)
    private readonly workflowRepository: WorkflowRepository,
    @Inject(RepositorySymbols.WorkflowStatusRepository)
    private readonly workflowStatusRepository: WorkflowStatusRepository,
    @Inject(RepositorySymbols.WorkflowTransitionRepository)
    private readonly workflowTransitionRepository: WorkflowTransitionRepository,
    @Inject(UsecaseSymbols.Card.NotifyCardChangeUsecase)
    private readonly notifyCardChangeUsecase: NotifyCardChangeUsecase,
  ) {}

  async execute(params: CreateCardUsecaseParams): Promise<Card> {
    const statusId = await resolveCardStatusId(this.statusDeps, {
      columnId: params.columnId,
      requestedStatusId: params.statusId,
    });

    const card = await this.cardRepository.create({
      columnId: params.columnId,
      title: params.title,
      description: params.description ?? null,
      order: params.order ?? 0,
      statusId,
      assigneeId: params.assigneeId ?? null,
      assignerId: params.assignerId ?? null,
      points: params.points ?? 0,
    });

    await this.notifyCardChangeUsecase.execute({
      before: null,
      after: card,
      actorId: params.actorId,
    });

    return card;
  }

  private get statusDeps(): CardStatusResolverDeps {
    return {
      columnRepository: this.columnRepository,
      boardRepository: this.boardRepository,
      statusRepository: this.statusRepository,
      columnStatusRepository: this.columnStatusRepository,
      workflowRepository: this.workflowRepository,
      workflowStatusRepository: this.workflowStatusRepository,
      workflowTransitionRepository: this.workflowTransitionRepository,
    };
  }
}
