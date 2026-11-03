import { Inject } from '@nestjs/common';
import {
  StatusRepository,
  WorkflowException,
  WorkflowFactory,
  WorkflowRepository,
  WorkflowStatusRepository,
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
import { UpdateWorkflowUsecase, UpdateWorkflowUsecaseParams } from './types';

export class UpdateWorkflowUsecaseImpl implements UpdateWorkflowUsecase {
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

    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(params: UpdateWorkflowUsecaseParams): Promise<WorkflowDetails> {
    this.workflowFactory.validate({ name: params.name });

    const existingWorkflow = await this.workflowRepository.findById(params.id);

    // A project always keeps one governing workflow; switch by promoting another.
    if (params.isDefault === false && existingWorkflow.isDefault) {
      throw WorkflowException.CannotUnsetDefault(params.id);
    }

    const workflow = await this.transactionManager.run(async () => {
      if (params.isDefault && !existingWorkflow.isDefault) {
        await this.workflowRepository.clearDefault(
          existingWorkflow.projectId,
          existingWorkflow.id,
        );
      }

      return await this.workflowRepository.update({
        id: params.id,
        name: params.name?.trim(),
        description:
          params.description === undefined
            ? undefined
            : params.description?.trim() || null,
        isDefault: params.isDefault,
        version: params.version,
      });
    });

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
