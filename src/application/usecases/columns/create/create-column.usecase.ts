import { Inject } from '@nestjs/common';
import { Column, ColumnRepository } from 'src/domain';
import { BoardStatus } from 'src/infrastructure/common/enum';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateColumnUsecase, CreateColumnUsecaseParams } from './types';

export class CreateColumnUsecaseImpl implements CreateColumnUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(params: CreateColumnUsecaseParams): Promise<Column> {
    return await this.columnRepository.create({
      boardId: params.boardId,
      name: params.name,
      order: params.order ?? 0,
      status: params.status ?? BoardStatus.ACTIVE,
    });
  }
}
