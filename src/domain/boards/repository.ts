import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { Board } from './entity';
import { BoardStruct } from './factory';
import { BoardMapper } from '../../infrastructure/database/mongodb/mappers';
import { BoardException } from './exception';
import { BoardDocument } from '../../infrastructure/database/mongodb/models';

export type BoardCreateParams = Omit<
  BoardStruct,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'version'
>;

export type BoardUpdateParams = Partial<Omit<BoardStruct, 'createdAt'>>;

export interface BoardGetQuery {
  page?: number;
  limit?: number;
  name?: string;
  projectId?: string;
}

export interface BoardGetResponse {
  data: Board[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface BoardRepository {
  create(board: BoardCreateParams): Promise<Board>;
  find(params: BoardGetQuery): Promise<BoardGetResponse>;
  findById(id: string): Promise<Board>;
  update(board: BoardUpdateParams & { id: string }): Promise<Board>;
  delete(id: string): Promise<string>;
}

export class BoardRepositoryImpl implements BoardRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(board: BoardCreateParams): Promise<Board> {
    const boardData = await this.boardModel.create({
      ...board,
    });

    return BoardMapper.toDomain(boardData);
  }

  async find(params: BoardGetQuery): Promise<BoardGetResponse> {
    const { page = 1, limit = 10, name, projectId } = params;

    const filter: Record<string, any> = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (projectId) {
      filter.projectId = new Types.ObjectId(projectId);
    }

    const totalCount = await this.boardModel.countDocuments(filter);

    const boardDataList = await this.boardModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: boardDataList.map((t) => BoardMapper.toDomain(t)),
      page,
      limit,
      totalCount,
    };
  }

  async findById(id: string): Promise<Board> {
    const boardData = await this.boardModel.findById(id).exec();

    if (!boardData) {
      throw BoardException.BoardNotFound(id);
    }

    return BoardMapper.toDomain(boardData);
  }

  async update(
    board: BoardUpdateParams & { id: string },
  ): Promise<Board> {
    const boardData = await this.boardModel.findById(board.id);

    if (!boardData) {
      throw BoardException.BoardNotFound(board.id);
    }

    boardData.name = board.name ?? boardData.name;
    boardData.description = board.description ?? boardData.description;
    if (board.projectId) {
      boardData.projectId = new Types.ObjectId(board.projectId);
    }
    boardData.status = board.status ?? boardData.status;
    boardData.version = board.version ?? boardData.version;
    boardData.updatedAt = new Date();

    await boardData.save();

    return BoardMapper.toDomain(boardData);
  }

  async delete(id: string): Promise<string> {
    await this.boardModel.findByIdAndDelete(id).exec();
    return id;
  }

  private get boardModel(): Model<BoardDocument> {
    return this.database.boardModel();
  }
}