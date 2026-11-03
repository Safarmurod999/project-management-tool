import { Inject } from '@nestjs/common';
import {
  StatusRepository,
  WorkflowException,
  WorkflowRepository,
  WorkflowStatusRepository,
  WorkflowTransitionRepository,
} from 'src/domain';
import { RealtimeService } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import {
  loadWorkflowDetails,
  toWorkflowEvent,
  WorkflowDetails,
  WorkflowDetailsDeps,
} from '../shared';
import {
  UpdateWorkflowTransitionUsecase,
  UpdateWorkflowTransitionUsecaseParams,
} from './types';

export class UpdateWorkflowTransitionUsecaseImpl
  implements UpdateWorkflowTransitionUsecase
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

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(
    params: UpdateWorkflowTransitionUsecaseParams,
  ): Promise<WorkflowDetails> {
    const workflow = await this.workflowRepository.findById(params.workflowId);
    const transition = await this.workflowTransitionRepository.findById(
      params.transitionId,
    );

    if (transition.workflowId !== workflow.id) {
      throw WorkflowException.TransitionNotInWorkflow(
        params.transitionId,
        workflow.id,
      );
    }

    // The repository re-validates the rule: both ends in the workflow, not a
    // self-transition and not a duplicate of another rule.
    await this.workflowTransitionRepository.update({
      id: transition.id,
      fromStatusId: params.fromStatusId,
      toStatusId: params.toStatusId,
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
