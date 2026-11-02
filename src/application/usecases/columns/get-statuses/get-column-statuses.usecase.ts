import { Inject } from '@nestjs/common';
import {
  ColumnRepository,
  ColumnStatusRepository,
  StatusRepository,
} from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  ColumnStatusDetails,
  GetColumnStatusesUsecase,
  GetColumnStatusesUsecaseParams,
} from './types';

export class GetColumnStatusesUsecaseImpl implements GetColumnStatusesUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,
    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,
  ) {}

  async execute(
    params: GetColumnStatusesUsecaseParams,
  ): Promise<ColumnStatusDetails[]> {
    await this.columnRepository.findById(params.columnId);

    const mappings = await this.columnStatusRepository.findByColumnId(
      params.columnId,
    );
    const statuses = await this.statusRepository.findByIds(
      mappings.map((mapping) => mapping.statusId),
    );
    const statusById = new Map(statuses.map((status) => [status.id, status]));

    return mappings
      .filter((mapping) => statusById.has(mapping.statusId))
      .map((mapping) => ({
        columnStatus: mapping,
        status: statusById.get(mapping.statusId)!,
      }));
  }
}
