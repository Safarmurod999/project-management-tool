import { Inject } from '@nestjs/common';
import { TeamRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetTeamsUsecase, GetTeamsUsecaseParams, GetTeamsUsecaseResult } from './types';

export class GetTeamsUsecaseImpl implements GetTeamsUsecase {
  constructor(
    @Inject(RepositorySymbols.TeamRepository)
    private teamRepository: TeamRepository,
  ) {}

  async execute(params: GetTeamsUsecaseParams): Promise<GetTeamsUsecaseResult> {
    return await this.teamRepository.find(params);
  }
}
