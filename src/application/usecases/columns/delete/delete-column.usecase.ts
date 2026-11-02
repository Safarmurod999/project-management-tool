import { Inject } from '@nestjs/common';
import { ColumnRepository, ColumnStatusRepository } from 'src/domain';
import { TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { DeleteColumnUsecase, DeleteColumnUsecaseParams } from './types';

export class DeleteColumnUsecaseImpl implements DeleteColumnUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,
    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(params: DeleteColumnUsecaseParams): Promise<string> {
    await this.columnRepository.findById(params.id);

    // Releases the column's statuses so they can be mapped to another column.
    return await this.transactionManager.run(async () => {
      await this.columnStatusRepository.deleteByColumnId(params.id);
      return await this.columnRepository.delete(params.id);
    });
  }
}
