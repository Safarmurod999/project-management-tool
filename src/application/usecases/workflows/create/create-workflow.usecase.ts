import { Inject } from '@nestjs/common';
import {
  StatusRepository,
  WorkflowFactory,
  WorkflowRepository,
  WorkflowStatusRepository,
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
import { CreateWorkflowUsecase, CreateWorkflowUsecaseParams } from './types';

export class CreateWorkflowUsecaseImpl implements CreateWorkflowUsecase {
  constructor(
    @Inject(RepositorySymbols.WorkflowRepository)
    private readonly workflowRepository: WorkflowRepository,

    @Inject(RepositorySymbols.WorkflowStatusRepository)
    private readonly workflowStatusRepository: WorkflowStatusRepository,

    @Inject(RepositorySymbols.WorkflowTransitionRepository)
    private readonly workflowTransitionRepository: WorkflowTransitionRepository,

    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,

    @Inject(FactorySymbols.WorkflowFactory)
    private readonly workflowFactory: WorkflowFactory,

    @Inject(FactorySymbols.WorkflowTransitionFactory)
    private readonly transitionFactory: WorkflowTransitionFactory,

    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(params: CreateWorkflowUsecaseParams): Promise<WorkflowDetails> {
    const data = this.workflowFactory.create(params);

    // Validate the rules before writing anything; the workflow id is set below.
    const rules = (params.transitions ?? []).flatMap((transition) =>
      this.transitionFactory.createRules(
        {
          workflowId: '',
          fromStatusId: transition.fromStatusId,
          toStatusId: transition.toStatusId,
        },
        transition.bidirectional,
      ),
    );

    const currentDefault = await this.workflowRepository.findDefaultByProjectId(
      data.projectId,
    );
    const isDefault = data.isDefault || !currentDefault;

    const workflow = await this.transactionManager.run(async () => {
      // Only one workflow per project governs its cards.
      if (isDefault && currentDefault) {
        await this.workflowRepository.clearDefault(data.projectId);
      }

      const created = await this.workflowRepository.create({
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        isDefault,
      });

      await this.workflowStatusRepository.createMany(
        created.id,
        params.statusIds ?? [],
      );
      await this.workflowTransitionRepository.createMany(
        rules.map((rule) => ({
          workflowId: created.id,
          fromStatusId: rule.fromStatusId,
          toStatusId: rule.toStatusId,
        })),
      );

      return created;
    });

    const details = await loadWorkflowDetails(this.detailsDeps, workflow);

    this.socket.emitToRoom(
      `project:${workflow.projectId}`,
      'workflow:created',
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
