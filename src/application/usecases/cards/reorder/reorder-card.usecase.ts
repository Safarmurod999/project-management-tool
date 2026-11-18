import { Inject } from '@nestjs/common';
import {
  BoardRepository,
  Card,
  CardException,
  CardRepository,
  ColumnRepository,
  ColumnStatusRepository,
  StatusRepository,
  WorkflowRepository,
  WorkflowStatusRepository,
  WorkflowTransitionRepository,
} from 'src/domain';
import { TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { NotifyCardChangeUsecase } from '../notify-change';
import { CardStatusResolverDeps, resolveCardStatusId } from '../shared';
import { ReorderCardUsecase, ReorderCardUsecaseParams } from './types';

export class ReorderCardUsecaseImpl implements ReorderCardUsecase {
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
    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,
    @Inject(UsecaseSymbols.Card.NotifyCardChangeUsecase)
    private readonly notifyCardChangeUsecase: NotifyCardChangeUsecase,
  ) {}

  async execute(params: ReorderCardUsecaseParams): Promise<Card> {
    if (params.newIndex < 0) {
      throw CardException.InvalidOrder();
    }

    const card = await this.cardRepository.findById(params.cardId);

    if (params.expectedStatusId && card.statusId !== params.expectedStatusId) {
      throw CardException.CurrentStatusMismatch(
        card.id,
        params.expectedStatusId,
      );
    }

    // Moving to another column keeps the card's status only if the target
    // column contains it; otherwise the target column's default is used.
    const statusId = await resolveCardStatusId(this.statusDeps, {
      columnId: params.targetColumnId,
      requestedStatusId: params.statusId,
      currentStatusId: card.statusId,
    });

    // Reordering rewrites the order of every card in the affected columns.
    // The status was validated against the one read above and is always
    // written, so the write is refused if the card left that status since.
    const moved = await this.transactionManager.run(() =>
      this.cardRepository.reorder({
        cardId: params.cardId,
        sourceColumnId: params.sourceColumnId,
        targetColumnId: params.targetColumnId,
        newIndex: params.newIndex,
        statusId,
        expectedStatusId: card.statusId,
      }),
    );

    // Sent once the transaction has committed; covers transitions too.
    await this.notifyCardChangeUsecase.execute({
      before: card,
      after: moved,
      actorId: params.actorId,
    });

    return moved;
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
