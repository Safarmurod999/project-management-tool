import { Inject } from '@nestjs/common';
import {
  WorkflowException,
  WorkflowRepository,
  WorkflowStatusRepository,
  WorkflowTransitionRepository,
} from 'src/domain';
import { RealtimeService, TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { DeleteWorkflowUsecase, DeleteWorkflowUsecaseParams } from './types';

export class DeleteWorkflowUsecaseImpl implements DeleteWorkflowUsecase {
  constructor(
    @Inject(RepositorySymbols.WorkflowRepository)
    private readonly workflowRepository: WorkflowRepository,

    @Inject(RepositorySymbols.WorkflowStatusRepository)
    private readonly workflowStatusRepository: WorkflowStatusRepository,

    @Inject(RepositorySymbols.WorkflowTransitionRepository)
    private readonly workflowTransitionRepository: WorkflowTransitionRepository,

    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,

    @Inject(ServiceSymbols.RealtimeService)
    private readonly socket: RealtimeService,
  ) {}

  async execute(params: DeleteWorkflowUsecaseParams): Promise<string> {
    const workflow = await this.workflowRepository.findById(params.id);

    // The default can only go when it is the project's last workflow, which
    // leaves the project's cards unrestricted again.
    if (workflow.isDefault) {
      const projectWorkflows = await this.workflowRepository.findByProjectId(
        workflow.projectId,
      );

      if (projectWorkflows.length > 1) {
        throw WorkflowException.CannotDeleteDefaultWorkflow(params.id);
      }
    }

    const deletedId = await this.transactionManager.run(async () => {
      await this.workflowTransitionRepository.deleteByWorkflowId(params.id);
      await this.workflowStatusRepository.deleteByWorkflowId(params.id);
      return await this.workflowRepository.delete(params.id);
    });

    this.socket.emitToRoom(
      `project:${workflow.projectId}`,
      'workflow:deleted',
      { id: deletedId, projectId: workflow.projectId },
    );

    return deletedId;
  }
}
