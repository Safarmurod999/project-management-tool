import { Inject } from '@nestjs/common';
import { StatusRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetStatusesUsecase, GetStatusesUsecaseParams } from './types';

export class GetStatusesUsecaseImpl implements GetStatusesUsecase {
  constructor(
    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,
  ) {}

  async execute(params: GetStatusesUsecaseParams) {
    return await this.statusRepository.find(params);
  }
}
