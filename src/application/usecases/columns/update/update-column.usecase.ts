import { Inject } from '@nestjs/common';
import {
  Column,
  ColumnException,
  ColumnRepository,
  ColumnStatusRepository,
} from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UpdateColumnUsecase, UpdateColumnUsecaseParams } from './types';

export class UpdateColumnUsecaseImpl implements UpdateColumnUsecase {
  constructor(
    @Inject(RepositorySymbols.ColumnRepository)
    private readonly columnRepository: ColumnRepository,
    @Inject(RepositorySymbols.ColumnStatusRepository)
    private readonly columnStatusRepository: ColumnStatusRepository,
  ) {}

  async execute(params: UpdateColumnUsecaseParams): Promise<Column> {
    const existingColumn = await this.columnRepository.findById(params.id);
    const boardId = params.boardId ?? existingColumn.boardId;
    const name = params.name ?? existingColumn.name;

    // Status mappings are unique per board, so they cannot follow a column
    // to another board implicitly.
    if (params.boardId && params.boardId !== existingColumn.boardId) {
      const mappings = await this.columnStatusRepository.findByColumnId(
        existingColumn.id,
      );

      if (mappings.length > 0) {
        throw ColumnException.CannotMoveColumnWithStatuses(existingColumn.id);
      }
    }

    if (params.name || params.boardId) {
      const duplicate = await this.columnRepository.find({
        boardId,
        name,
        page: 1,
        limit: 1,
      });

      if (
        duplicate.data.length > 0 &&
        duplicate.data[0].id !== existingColumn.id
      ) {
        throw ColumnException.ColumnAlreadyExists(name, boardId);
      }
    }

    return await this.columnRepository.update({
      id: params.id,
      boardId: params.boardId,
      name: params.name,
      order: params.order,
      version: params.version,
    });
  }
}
