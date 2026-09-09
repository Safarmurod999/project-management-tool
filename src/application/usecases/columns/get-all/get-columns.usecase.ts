import { Inject } from '@nestjs/common';
import { ColumnRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetColumnsUsecase, GetColumnsUsecaseParams } from './types';

export class GetColumnsUsecaseImpl implements GetColumnsUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(params: GetColumnsUsecaseParams) {
    return await this.columnRepository.find(params);
  }
}
