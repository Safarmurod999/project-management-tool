import { Inject } from '@nestjs/common';
import {
  StatusRepository,
  WorkflowException,
  WorkflowRepository,
  WorkflowStatusRepository,
  WorkflowTransitionRepository,
} from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  loadWorkflowDetails,
  WorkflowDetails,
  WorkflowDetailsDeps,
} from '../shared';
import {
  FindProjectWorkflowUsecase,
  FindProjectWorkflowUsecaseParams,
} from './types';

export class FindProjectWorkflowUsecaseImpl
  implements FindProjectWorkflowUsecase
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
  ) {}

  async execute(
    params: FindProjectWorkflowUsecaseParams,
  ): Promise<WorkflowDetails> {
    const workflow = await this.workflowRepository.findDefaultByProjectId(
      params.projectId,
    );

    if (!workflow) {
      throw WorkflowException.ProjectHasNoWorkflow(params.projectId);
    }

    return await loadWorkflowDetails(this.detailsDeps, workflow);
  }

  private get detailsDeps(): WorkflowDetailsDeps {
    return {
      statusRepository: this.statusRepository,
      workflowStatusRepository: this.workflowStatusRepository,
      workflowTransitionRepository: this.workflowTransitionRepository,
    };
  }
}
