import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { ColumnStatusDocument } from 'src/infrastructure/database/mongodb/models';
import { ColumnStatusMapper } from 'src/infrastructure/database/mongodb/mappers';
import { ColumnStatus } from './entity';
import { ColumnStatusException } from './exception';

export interface ColumnStatusCreateParams {
  columnId: string;
  statusId: string;
  /** Position inside the column; appended at the end when omitted. */
  order?: number;
}

export interface ColumnStatusRepository {
  create(params: ColumnStatusCreateParams): Promise<ColumnStatus>;
  findByColumnId(columnId: string): Promise<ColumnStatus[]>;
  findByBoardId(boardId: string): Promise<ColumnStatus[]>;
  findOne(columnId: string, statusId: string): Promise<ColumnStatus | null>;
  delete(columnId: string, statusId: string): Promise<string>;
  deleteByColumnId(columnId: string): Promise<number>;
  deleteByStatusId(statusId: string): Promise<number>;
}

export class ColumnStatusRepositoryImpl implements ColumnStatusRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(params: ColumnStatusCreateParams): Promise<ColumnStatus> {
    if (params.order !== undefined && params.order < 0) {
      throw ColumnStatusException.InvalidOrder();
    }

    const column = await this.database
      .columnModel()
      .findById(params.columnId)
      .exec();

    if (!column) {
      throw ColumnStatusException.InvalidColumnId(params.columnId);
    }

    const status = await this.database
      .statusModel()
      .findById(params.statusId)
      .exec();

    if (!status) {
      throw ColumnStatusException.InvalidStatusId(params.statusId);
    }

    const board = await this.database
      .boardModel()
      .findById(column.boardId)
      .exec();

    if (!board || board.projectId.toString() !== status.projectId.toString()) {
      throw ColumnStatusException.ProjectMismatch(
        params.statusId,
        column.boardId.toString(),
      );
    }

    const existing = await this.columnStatusModel
      .findOne({ boardId: column.boardId, statusId: status._id })
      .exec();

    if (existing) {
      throw ColumnStatusException.StatusAlreadyMapped(
        params.statusId,
        column.boardId.toString(),
      );
    }

    const order =
      params.order ??
      (await this.columnStatusModel.countDocuments({ columnId: column._id }));

    const columnStatusData = await this.columnStatusModel.create({
      boardId: column.boardId,
      columnId: column._id,
      statusId: status._id,
      order,
    });

    return ColumnStatusMapper.toDomain(columnStatusData);
  }

  async findByColumnId(columnId: string): Promise<ColumnStatus[]> {
    const dataList = await this.columnStatusModel
      .find({ columnId: new Types.ObjectId(columnId) })
      .sort({ order: 1 })
      .exec();

    return dataList.map((item) => ColumnStatusMapper.toDomain(item));
  }

  async findByBoardId(boardId: string): Promise<ColumnStatus[]> {
    const dataList = await this.columnStatusModel
      .find({ boardId: new Types.ObjectId(boardId) })
      .sort({ order: 1 })
      .exec();

    return dataList.map((item) => ColumnStatusMapper.toDomain(item));
  }

  async findOne(
    columnId: string,
    statusId: string,
  ): Promise<ColumnStatus | null> {
    const data = await this.columnStatusModel
      .findOne({
        columnId: new Types.ObjectId(columnId),
        statusId: new Types.ObjectId(statusId),
      })
      .exec();

    return data ? ColumnStatusMapper.toDomain(data) : null;
  }

  async delete(columnId: string, statusId: string): Promise<string> {
    const data = await this.columnStatusModel
      .findOneAndDelete({
        columnId: new Types.ObjectId(columnId),
        statusId: new Types.ObjectId(statusId),
      })
      .exec();

    if (!data) {
      throw ColumnStatusException.MappingNotFound(columnId, statusId);
    }

    return data._id.toString();
  }

  async deleteByColumnId(columnId: string): Promise<number> {
    const result = await this.columnStatusModel
      .deleteMany({ columnId: new Types.ObjectId(columnId) })
      .exec();

    return result.deletedCount;
  }

  async deleteByStatusId(statusId: string): Promise<number> {
    const result = await this.columnStatusModel
      .deleteMany({ statusId: new Types.ObjectId(statusId) })
      .exec();

    return result.deletedCount;
  }

  private get columnStatusModel(): Model<ColumnStatusDocument> {
    return this.database.columnStatusModel();
  }
}
