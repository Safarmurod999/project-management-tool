import { Inject } from '@nestjs/common';
import { Column, ColumnRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindColumnByIdUsecase, FindColumnByIdUsecaseParams } from './types';

export class FindColumnByIdUsecaseImpl implements FindColumnByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(params: FindColumnByIdUsecaseParams): Promise<Column> {
    return await this.columnRepository.findById(params.id);
  }
}
