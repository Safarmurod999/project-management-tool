import { Inject } from '@nestjs/common';
import { Status, StatusRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindStatusByIdUsecase, FindStatusByIdUsecaseParams } from './types';

export class FindStatusByIdUsecaseImpl implements FindStatusByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,
  ) {}

  async execute(params: FindStatusByIdUsecaseParams): Promise<Status> {
    return await this.statusRepository.findById(params.id);
  }
}
