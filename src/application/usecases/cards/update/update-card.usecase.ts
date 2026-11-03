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
    @Inject(RepositorySymbols.WorkflowRepository)
    private readonly workflowRepository: WorkflowRepository,
    @Inject(RepositorySymbols.WorkflowStatusRepository)
    private readonly workflowStatusRepository: WorkflowStatusRepository,
    @Inject(RepositorySymbols.WorkflowTransitionRepository)
    private readonly workflowTransitionRepository: WorkflowTransitionRepository,
    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,
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

    const statusChanged =
      statusId !== undefined && statusId !== existingCard.statusId;

    // A status change was validated against the status read above; the write
    // runs in a transaction and is refused if the card left that status since.
    return await this.transactionManager.run(() =>
      this.cardRepository.update({
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
        expectedStatusId: statusChanged ? existingCard.statusId : undefined,
      }),
    );
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
