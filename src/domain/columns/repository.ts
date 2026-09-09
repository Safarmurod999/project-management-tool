import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { ColumnDocument } from 'src/infrastructure/database/mongodb/models';
import { ColumnMapper } from 'src/infrastructure/database/mongodb/mappers';
import { Column } from './entity';
import { ColumnStruct } from './factory';
import { ColumnException } from './exception';

export type ColumnCreateParams = Omit<
  ColumnStruct,
  'id' | 'createdAt' | 'updatedAt' | 'version'
> & {
  status?: ColumnStruct['status'];
};

export type ColumnUpdateParams = Partial<Omit<ColumnStruct, 'createdAt'>>;

export interface ColumnGetQuery {
  page?: number;
  limit?: number;
  boardId: string;
  name?: string;
}

export interface ColumnGetResponse {
  data: Column[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface ColumnRepository {
  create(column: ColumnCreateParams): Promise<Column>;
  find(params: ColumnGetQuery): Promise<ColumnGetResponse>;
  findById(id: string): Promise<Column>;
  update(column: ColumnUpdateParams & { id: string }): Promise<Column>;
  delete(id: string): Promise<string>;
}

export class ColumnRepositoryImpl implements ColumnRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(column: ColumnCreateParams): Promise<Column> {
    const board = await this.database.boardModel().findById(column.boardId).exec();

    if (!board) {
      throw ColumnException.InvalidBoardId(column.boardId);
    }

    const existing = await this.columnModel
      .findOne({ boardId: new Types.ObjectId(column.boardId), name: column.name })
      .exec();

    if (existing) {
      throw ColumnException.ColumnAlreadyExists(column.name, column.boardId);
    }

    const columnData = await this.columnModel.create({
      ...column,
      boardId: new Types.ObjectId(column.boardId),
    });

    return ColumnMapper.toDomain(columnData);
  }

  async find(params: ColumnGetQuery): Promise<ColumnGetResponse> {
    const { page = 1, limit = 10, boardId, name } = params;

    const filter: Record<string, any> = { boardId: new Types.ObjectId(boardId) };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const totalCount = await this.columnModel.countDocuments(filter);

    const columnDataList = await this.columnModel
      .find(filter)
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: columnDataList.map((item) => ColumnMapper.toDomain(item)),
      page,
      limit,
      totalCount,
    };
  }

  async findById(id: string): Promise<Column> {
    const columnData = await this.columnModel.findById(id).exec();

    if (!columnData) {
      throw ColumnException.ColumnNotFound(id);
    }

    return ColumnMapper.toDomain(columnData);
  }

  async update(column: ColumnUpdateParams & { id: string }): Promise<Column> {
    const existingColumn = await this.columnModel.findById(column.id).exec();

    if (!existingColumn) {
      throw ColumnException.ColumnNotFound(column.id);
    }

    if (column.boardId) {
      const board = await this.database.boardModel().findById(column.boardId).exec();
      if (!board) {
        throw ColumnException.InvalidBoardId(column.boardId);
      }
      existingColumn.boardId = new Types.ObjectId(column.boardId);
    }

    if (column.name) {
      const duplicate = await this.columnModel
        .findOne({
          boardId: existingColumn.boardId,
          name: column.name,
          _id: { $ne: existingColumn._id },
        })
        .exec();

      if (duplicate) {
        throw ColumnException.ColumnAlreadyExists(
          column.name,
          existingColumn.boardId.toString(),
        );
      }

      existingColumn.name = column.name;
    }

    if (column.order !== undefined) existingColumn.order = column.order;
    if (column.status) existingColumn.status = column.status;
    if (column.version) existingColumn.version = column.version;
    existingColumn.updatedAt = new Date();

    await existingColumn.save();

    return ColumnMapper.toDomain(existingColumn);
  }

  async delete(id: string): Promise<string> {
    const column = await this.columnModel.findById(id).exec();

    if (!column) {
      throw ColumnException.ColumnNotFound(id);
    }

    await this.columnModel.findByIdAndDelete(id).exec();
    return id;
  }

  private get columnModel(): Model<ColumnDocument> {
    return this.database.columnModel();
  }
}
