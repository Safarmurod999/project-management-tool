import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { StatusDocument } from 'src/infrastructure/database/mongodb/models';
import { StatusMapper } from 'src/infrastructure/database/mongodb/mappers';
import { Status } from './entity';
import { StatusStruct } from './factory';
import { StatusException } from './exception';

export type StatusCreateParams = Omit<
  StatusStruct,
  'id' | 'createdAt' | 'updatedAt' | 'version'
>;

export type StatusUpdateParams = Partial<
  Omit<StatusStruct, 'createdAt' | 'projectId'>
>;

export interface StatusGetQuery {
  page?: number;
  limit?: number;
  projectId: string;
  name?: string;
  code?: string;
}

export interface StatusGetResponse {
  data: Status[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface StatusRepository {
  create(status: StatusCreateParams): Promise<Status>;
  createMany(statuses: StatusCreateParams[]): Promise<Status[]>;
  find(params: StatusGetQuery): Promise<StatusGetResponse>;
  findById(id: string): Promise<Status>;
  findByIds(ids: string[]): Promise<Status[]>;
  findByProjectId(projectId: string): Promise<Status[]>;
  update(status: StatusUpdateParams & { id: string }): Promise<Status>;
  /** Clears `isDefault` on every status of the project except `exceptId`. */
  clearDefault(projectId: string, exceptId?: string): Promise<void>;
  delete(id: string): Promise<string>;
}

export class StatusRepositoryImpl implements StatusRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(status: StatusCreateParams): Promise<Status> {
    await this.assertProjectExists(status.projectId);

    const existing = await this.statusModel
      .findOne({
        projectId: new Types.ObjectId(status.projectId),
        code: status.code,
      })
      .exec();

    if (existing) {
      throw StatusException.StatusAlreadyExists(status.code, status.projectId);
    }

    const statusData = await this.statusModel.create({
      ...status,
      projectId: new Types.ObjectId(status.projectId),
    });

    return StatusMapper.toDomain(statusData);
  }

  async createMany(statuses: StatusCreateParams[]): Promise<Status[]> {
    if (statuses.length === 0) {
      return [];
    }

    const projectIds = [...new Set(statuses.map((item) => item.projectId))];
    for (const projectId of projectIds) {
      await this.assertProjectExists(projectId);
    }

    const statusDataList = await this.statusModel.insertMany(
      statuses.map((item) => ({
        ...item,
        projectId: new Types.ObjectId(item.projectId),
      })),
    );

    return statusDataList.map((item) =>
      StatusMapper.toDomain(item as unknown as StatusDocument),
    );
  }

  async find(params: StatusGetQuery): Promise<StatusGetResponse> {
    const { page = 1, limit = 50, projectId, name, code } = params;

    const filter: Record<string, any> = {
      projectId: new Types.ObjectId(projectId),
    };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (code) {
      filter.code = code;
    }

    const totalCount = await this.statusModel.countDocuments(filter);

    const statusDataList = await this.statusModel
      .find(filter)
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: statusDataList.map((item) => StatusMapper.toDomain(item)),
      page,
      limit,
      totalCount,
    };
  }

  async findById(id: string): Promise<Status> {
    const statusData = await this.statusModel.findById(id).exec();

    if (!statusData) {
      throw StatusException.StatusNotFound(id);
    }

    return StatusMapper.toDomain(statusData);
  }

  async findByIds(ids: string[]): Promise<Status[]> {
    if (ids.length === 0) {
      return [];
    }

    const statusDataList = await this.statusModel
      .find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } })
      .sort({ order: 1 })
      .exec();

    return statusDataList.map((item) => StatusMapper.toDomain(item));
  }

  async findByProjectId(projectId: string): Promise<Status[]> {
    const statusDataList = await this.statusModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ order: 1 })
      .exec();

    return statusDataList.map((item) => StatusMapper.toDomain(item));
  }

  async update(status: StatusUpdateParams & { id: string }): Promise<Status> {
    const existingStatus = await this.statusModel.findById(status.id).exec();

    if (!existingStatus) {
      throw StatusException.StatusNotFound(status.id);
    }

    if (status.code && status.code !== existingStatus.code) {
      const duplicate = await this.statusModel
        .findOne({
          projectId: existingStatus.projectId,
          code: status.code,
          _id: { $ne: existingStatus._id },
        })
        .exec();

      if (duplicate) {
        throw StatusException.StatusAlreadyExists(
          status.code,
          existingStatus.projectId.toString(),
        );
      }

      existingStatus.code = status.code;
    }

    if (status.name) existingStatus.name = status.name;
    if (status.color) existingStatus.color = status.color;
    if (status.order !== undefined) existingStatus.order = status.order;
    if (status.isDefault !== undefined)
      existingStatus.isDefault = status.isDefault;
    if (status.version) existingStatus.version = status.version;
    existingStatus.updatedAt = new Date();

    await existingStatus.save();

    return StatusMapper.toDomain(existingStatus);
  }

  async clearDefault(projectId: string, exceptId?: string): Promise<void> {
    const filter: Record<string, any> = {
      projectId: new Types.ObjectId(projectId),
      isDefault: true,
    };

    if (exceptId) {
      filter._id = { $ne: new Types.ObjectId(exceptId) };
    }

    await this.statusModel
      .updateMany(filter, { $set: { isDefault: false, updatedAt: new Date() } })
      .exec();
  }

  async delete(id: string): Promise<string> {
    const status = await this.statusModel.findById(id).exec();

    if (!status) {
      throw StatusException.StatusNotFound(id);
    }

    await this.statusModel.findByIdAndDelete(id).exec();
    return id;
  }

  private async assertProjectExists(projectId: string): Promise<void> {
    const project = await this.database
      .projectModel()
      .findById(projectId)
      .exec();

    if (!project) {
      throw StatusException.InvalidProjectId(projectId);
    }
  }

  private get statusModel(): Model<StatusDocument> {
    return this.database.statusModel();
  }
}
