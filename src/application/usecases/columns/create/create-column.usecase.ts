import { Inject } from '@nestjs/common';
import { Column, ColumnRepository, ColumnStatusRepository } from 'src/domain';
import { TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { CreateColumnUsecase, CreateColumnUsecaseParams } from './types';

export class CreateColumnUsecaseImpl implements CreateColumnUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,
    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(params: CreateColumnUsecaseParams): Promise<Column> {
    return await this.transactionManager.run(async () => {
      const column = await this.columnRepository.create({
        boardId: params.boardId,
        name: params.name,
        order: params.order ?? 0,
      });

      for (const [order, statusId] of (params.statusIds ?? []).entries()) {
        await this.columnStatusRepository.create({
          columnId: column.id,
          statusId,
          order,
        });
      }

      return column;
    });
  }
}
