import { Inject } from '@nestjs/common';
import {
  CardRepository,
  StatusRepository,
  WorkflowException,
  WorkflowRepository,
  WorkflowStatusException,
  WorkflowStatusRepository,
  WorkflowTransitionRepository,
} from 'src/domain';
import { RealtimeService, TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import {
  loadWorkflowDetails,
  toWorkflowEvent,
  WorkflowDetails,
  WorkflowDetailsDeps,
} from '../shared';
import {
  RemoveWorkflowStatusUsecase,
  RemoveWorkflowStatusUsecaseParams,
} from './types';

export class RemoveWorkflowStatusUsecaseImpl
  implements RemoveWorkflowStatusUsecase
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

    @Inject(RepositorySymbols.CardRepository)
    private readonly cardRepository: CardRepository,

    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(
    params: RemoveWorkflowStatusUsecaseParams,
  ): Promise<WorkflowDetails> {
    const workflow = await this.workflowRepository.findById(params.workflowId);

    if (
      !(await this.workflowStatusRepository.exists(
        workflow.id,
        params.statusId,
      ))
    ) {
      throw WorkflowStatusException.StatusNotInWorkflow(
        params.statusId,
        workflow.id,
      );
    }

    // Cards of the project would be stranded in a status their workflow no
    // longer contains. Statuses are project-scoped, so this count is too.
    if (
      workflow.isDefault &&
      (await this.cardRepository.countByStatusId(params.statusId)) > 0
    ) {
      throw WorkflowException.StatusInUse(params.statusId, workflow.id);
    }

    await this.transactionManager.run(async () => {
      await this.workflowTransitionRepository.deleteByStatus(
        workflow.id,
        params.statusId,
      );
      await this.workflowStatusRepository.delete(workflow.id, params.statusId);
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
