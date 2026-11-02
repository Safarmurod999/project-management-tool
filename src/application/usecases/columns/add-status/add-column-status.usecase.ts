import { Inject } from '@nestjs/common';
import { ColumnStatusRepository, StatusRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ColumnStatusDetails } from '../get-statuses/types';
import { AddColumnStatusUsecase, AddColumnStatusUsecaseParams } from './types';

export class AddColumnStatusUsecaseImpl implements AddColumnStatusUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,
    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,
  ) {}

  async execute(
    params: AddColumnStatusUsecaseParams,
  ): Promise<ColumnStatusDetails> {
    // The repository enforces column/status existence, same project and
    // one-column-per-board uniqueness.
    const columnStatus = await this.columnStatusRepository.create({
      columnId: params.columnId,
      statusId: params.statusId,
      order: params.order,
    });
    const status = await this.statusRepository.findById(params.statusId);

    return { columnStatus, status };
  }
}
