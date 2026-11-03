import { Inject } from '@nestjs/common';
import { WorkflowRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetWorkflowsUsecase, GetWorkflowsUsecaseParams } from './types';

export class GetWorkflowsUsecaseImpl implements GetWorkflowsUsecase {
  constructor(
    @Inject(RepositorySymbols.WorkflowRepository)
    private readonly workflowRepository: WorkflowRepository,
  ) {}

  async execute(params: GetWorkflowsUsecaseParams) {
    return await this.workflowRepository.find(params);
  }
}
