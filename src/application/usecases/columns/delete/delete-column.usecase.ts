import { Inject } from '@nestjs/common';
import { ColumnRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { DeleteColumnUsecase, DeleteColumnUsecaseParams } from './types';

export class DeleteColumnUsecaseImpl implements DeleteColumnUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(params: DeleteColumnUsecaseParams): Promise<string> {
    await this.columnRepository.findById(params.id);
    return await this.columnRepository.delete(params.id);
  }
}
