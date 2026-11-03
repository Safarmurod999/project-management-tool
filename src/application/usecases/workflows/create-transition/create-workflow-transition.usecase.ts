import { Inject } from '@nestjs/common';
import {
  StatusRepository,
  WorkflowRepository,
  WorkflowStatusRepository,
  WorkflowTransitionException,
  WorkflowTransitionFactory,
  WorkflowTransitionRepository,
} from 'src/domain';
import { RealtimeService, TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FactorySymbols } from 'src/infrastructure/dependency-injection/factories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import {
  loadWorkflowDetails,
  toWorkflowEvent,
  WorkflowDetails,
  WorkflowDetailsDeps,
} from '../shared';
import {
  CreateWorkflowTransitionUsecase,
  CreateWorkflowTransitionUsecaseParams,
} from './types';

export class CreateWorkflowTransitionUsecaseImpl
  implements CreateWorkflowTransitionUsecase
{
  constructor(
    @Inject(RepositorySymbols.WorkflowRepository)
    private readonly workflowRepository: WorkflowRepository,

    @Inject(RepositorySymbols.WorkflowStatusRepository)
    private readonly workflowStatusRepository: WorkflowStatusRepository,

    @Inject(RepositorySymbols.WorkflowTransitionRepository)
    private readonly workflowTransitionRepository: WorkflowTransitionRepository,

    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,

    @Inject(FactorySymbols.WorkflowTransitionFactory)
    private readonly transitionFactory: WorkflowTransitionFactory,

    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(
    params: CreateWorkflowTransitionUsecaseParams,
  ): Promise<WorkflowDetails> {
    const workflow = await this.workflowRepository.findById(params.workflowId);

    const rules = this.transitionFactory.createRules(
      {
        workflowId: workflow.id,
        fromStatusId: params.fromStatusId,
        toStatusId: params.toStatusId,
      },
      params.bidirectional,
    );

    const missing: typeof rules = [];
    for (const rule of rules) {
      if (
        !(await this.workflowTransitionRepository.exists(
          rule.workflowId,
          rule.fromStatusId,
          rule.toStatusId,
        ))
      ) {
        missing.push(rule);
      }
    }

    if (missing.length === 0) {
      throw WorkflowTransitionException.TransitionAlreadyExists(
        params.fromStatusId,
        params.toStatusId,
        workflow.id,
      );
    }

    // Both directions of a two-way transition are written together.
    await this.transactionManager.run(() =>
      this.workflowTransitionRepository.createMany(
        missing.map((rule) => ({
          workflowId: rule.workflowId,
          fromStatusId: rule.fromStatusId,
          toStatusId: rule.toStatusId,
        })),
      ),
    );

    const details = await loadWorkflowDetails(this.detailsDeps, workflow);

    this.socket.emitToRoom(
      `project:${workflow.projectId}`,
      'workflow:updated',
      toWorkflowEvent(details),
    );

    return details;
  }

  private get detailsDeps(): WorkflowDetailsDeps {
    return {
      statusRepository: this.statusRepository,
      workflowStatusRepository: this.workflowStatusRepository,
      workflowTransitionRepository: this.workflowTransitionRepository,
    };
  }
}
