import { Inject } from '@nestjs/common';
import {
  StatusRepository,
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
  FindWorkflowByIdUsecase,
  FindWorkflowByIdUsecaseParams,
} from './types';

export class FindWorkflowByIdUsecaseImpl implements FindWorkflowByIdUsecase {
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
    params: FindWorkflowByIdUsecaseParams,
  ): Promise<WorkflowDetails> {
    const workflow = await this.workflowRepository.findById(params.id);
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
