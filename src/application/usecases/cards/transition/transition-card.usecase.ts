import { Inject } from '@nestjs/common';
import {
  BoardRepository,
  Card,
  CardException,
  CardRepository,
  ColumnRepository,
  ColumnStatusRepository,
  WorkflowException,
  WorkflowRepository,
  WorkflowTransition,
  WorkflowTransitionException,
  WorkflowTransitionRepository,
} from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UsecaseSymbols } from 'src/infrastructure/dependency-injection/usecases/symbol';
import { ReorderCardUsecase } from '../reorder';
import { TransitionCardUsecase, TransitionCardUsecaseParams } from './types';

export class TransitionCardUsecaseImpl implements TransitionCardUsecase {
  constructor(
    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
    @Inject(RepositorySymbols.BoardRepository)
    private readonly boardRepository: BoardRepository,
    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,
    @Inject(RepositorySymbols.WorkflowRepository)
    private readonly workflowRepository: WorkflowRepository,
    @Inject(RepositorySymbols.WorkflowTransitionRepository)
    private readonly workflowTransitionRepository: WorkflowTransitionRepository,
    @Inject(UsecaseSymbols.Card.ReorderCardUsecase)
    private readonly reorderCardUsecase: ReorderCardUsecase,
  ) {}

  async execute(params: TransitionCardUsecaseParams): Promise<Card> {
    const card = await this.cardRepository.findById(params.cardId);
    const column = await this.columnRepository.findById(card.columnId);
    const board = await this.boardRepository.findById(column.boardId);
    const workflow = await this.workflowRepository.findDefaultByProjectId(
      board.projectId,
    );

    if (!workflow) {
      throw WorkflowException.ProjectHasNoWorkflow(board.projectId);
    }

    const transition = await this.findTransition(
      workflow.id,
      card.statusId,
      params,
    );

    if (transition.fromStatusId !== card.statusId) {
      throw CardException.TransitionFromMismatch(
        card.id,
        card.statusId,
        transition.fromStatusId,
      );
    }

    // A status sits in at most one column per board, so it decides the column.
    const mapping = (
      await this.columnStatusRepository.findByBoardId(board.id)
    ).find((item) => item.statusId === transition.toStatusId);

    if (!mapping) {
      throw CardException.StatusNotOnBoard(transition.toStatusId, board.id);
    }

    const sameColumn = mapping.columnId === card.columnId;

    // Reuses the reorder flow: it re-validates the status against the column
    // and workflow, and writes the move in a transaction that fails if the
    // card left `fromStatusId` in the meantime.
    return await this.reorderCardUsecase.execute({
      cardId: card.id,
      sourceColumnId: card.columnId,
      targetColumnId: mapping.columnId,
      newIndex: sameColumn ? card.order : Number.MAX_SAFE_INTEGER,
      statusId: transition.toStatusId,
      expectedStatusId: transition.fromStatusId,
    });
  }

  private async findTransition(
    workflowId: string,
    currentStatusId: string,
    params: TransitionCardUsecaseParams,
  ): Promise<WorkflowTransition> {
    if (params.transitionId) {
      const transition = await this.workflowTransitionRepository.findById(
        params.transitionId,
      );

      if (transition.workflowId !== workflowId) {
        throw WorkflowException.TransitionNotInWorkflow(
          params.transitionId,
          workflowId,
        );
      }

      return transition;
    }

    if (!params.toStatusId) {
      throw CardException.TransitionTargetRequired();
    }

    const transition = await this.workflowTransitionRepository.findOne(
      workflowId,
      currentStatusId,
      params.toStatusId,
    );

    if (!transition) {
      throw WorkflowTransitionException.TransitionNotAllowed(
        currentStatusId,
        params.toStatusId,
      );
    }

    return transition;
  }
}
