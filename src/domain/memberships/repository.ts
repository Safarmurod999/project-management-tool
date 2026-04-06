import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { Membership, MembershipDetails } from './entity';
import { MembershipException } from './exception';
import { MembershipStruct } from './factory';
import { MembershipDocument } from 'src/infrastructure/database/mongodb/models';
import { MembershipMapper } from 'src/infrastructure/database/mongodb/mappers';
import { ScopeType } from 'src/infrastructure/common/enum';

export type MembershipCreateParams = Omit<
  MembershipStruct,
  'id' | 'createdAt' | 'updatedAt'
>;

export type MembershipUpdateParams = Partial<
  Omit<MembershipStruct, 'createdAt'>
>;

export interface MembershipGetQuery {
  page?: number;
  limit?: number;
  userId?: string;
  scopeType?: ScopeType;
  scopeId?: string;
  roleId?: string;
}

export interface MembershipGetResponse {
  data: Membership[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface MembershipGetPopulatedResponse {
  data: MembershipDetails[];
  page: number;
  limit: number;
  totalCount: number;
}

export interface MembershipRepository {
  create(data: MembershipCreateParams): Promise<Membership>;
  find(params: MembershipGetQuery): Promise<MembershipGetResponse>;
  findAll(params: Omit<MembershipGetQuery, 'page' | 'limit'>): Promise<Membership[]>;
  findAndPopulate(params: MembershipGetQuery): Promise<MembershipGetPopulatedResponse>;
  findById(id: string): Promise<Membership>;
  update(data: MembershipUpdateParams & { id: string }): Promise<Membership>;
  delete(id: string): Promise<string>;
}

export class MembershipRepositoryImpl implements MembershipRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(data: MembershipCreateParams): Promise<Membership> {
    const membershipData = await this.membershipModel.create({
      userId: new Types.ObjectId(data.userId),
      scopeType: data.scopeType,
      scopeId: new Types.ObjectId(data.scopeId),
      roleId: new Types.ObjectId(data.roleId),
      override: data.override,
    });

    return MembershipMapper.toDomain(membershipData);
  }

  async find(params: MembershipGetQuery): Promise<MembershipGetResponse> {
    const { page = 1, limit = 10 } = params;
    const filter = this.buildFilter(params);

    const totalCount = await this.membershipModel.countDocuments(filter);

    const membershipDataList = await this.membershipModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: membershipDataList.map((membership) =>
        MembershipMapper.toDomain(membership),
      ),
      page,
      limit,
      totalCount,
    };
  }

  async findAll(
    params: Omit<MembershipGetQuery, 'page' | 'limit'>,
  ): Promise<Membership[]> {
    const filter = this.buildFilter(params);
    const membershipDataList = await this.membershipModel.find(filter).exec();

    return membershipDataList.map((membership) => MembershipMapper.toDomain(membership));
  }

  async findAndPopulate(
    params: MembershipGetQuery,
  ): Promise<MembershipGetPopulatedResponse> {
    const { page = 1, limit = 10 } = params;
    const filter = this.buildFilter(params);

    const totalCount = await this.membershipModel.countDocuments(filter);

    const membershipDataList = await this.membershipModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate([
        { path: 'userId', select: 'name email' },
        { path: 'roleId', select: 'name code description' },
      ])
      .exec();

    return {
      data: membershipDataList.map((membership) =>
        MembershipMapper.toDetailsDomain(membership),
      ),
      page,
      limit,
      totalCount,
    };
  }

  async findById(id: string): Promise<Membership> {
    const membershipData = await this.membershipModel.findById(id).exec();

    if (!membershipData) {
      throw MembershipException.MembershipNotFound(id);
    }

    return MembershipMapper.toDomain(membershipData);
  }

  async update(
    data: MembershipUpdateParams & { id: string },
  ): Promise<Membership> {
    const membershipData = await this.membershipModel.findById(data.id);

    if (!membershipData) {
      throw MembershipException.MembershipNotFound(data.id);
    }

    if (data.userId) {
      membershipData.userId = new Types.ObjectId(data.userId);
    }

    membershipData.scopeType = data.scopeType ?? membershipData.scopeType;

    if (data.scopeId) {
      membershipData.scopeId = new Types.ObjectId(data.scopeId);
    }

    if (data.roleId) {
      membershipData.roleId = new Types.ObjectId(data.roleId);
    }

    membershipData.override = data.override ?? membershipData.override;

    membershipData.updatedAt = new Date();

    await membershipData.save();

    return MembershipMapper.toDomain(membershipData);
  }

  async delete(id: string): Promise<string> {
    await this.membershipModel.findByIdAndDelete(id).exec();
    return id;
  }

  private get membershipModel(): Model<MembershipDocument> {
    return this.database.membershipModel();
  }

  private buildFilter(
    params: Pick<MembershipGetQuery, 'userId' | 'scopeType' | 'scopeId' | 'roleId'>,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {};
    const { userId, scopeType, scopeId, roleId } = params;

    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    if (scopeType) {
      filter.scopeType = scopeType;
    }

    if (scopeId) {
      filter.scopeId = new Types.ObjectId(scopeId);
    }

    if (roleId) {
      filter.roleId = new Types.ObjectId(roleId);
    }

    return filter;
  }
}
