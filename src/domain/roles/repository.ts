import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Role } from './entity';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { RoleDocument } from 'src/infrastructure/database/mongodb/models';
import { RoleStruct } from './factory';
import { RoleException } from './exception';
import { RoleMapper } from 'src/infrastructure/database/mongodb/mappers/roles.mapper';

export type RoleCreateParams = Omit<RoleStruct, 'id' | 'createdAt' | 'updatedAt' | 'permissions'> & { permissions: string[] };
export type RoleUpdateParams = Omit<RoleStruct, 'createdAt' | 'updatedAt' | 'permissions'> & { permissions: string[] };

export interface RoleGetQuery {
  page?: number;
  limit?: number;
  name?: string;
}

export interface RoleGetResponse {
  data: Role[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface RoleRepository {
  create(role: RoleCreateParams): Promise<Role>;
  find(params: RoleGetQuery): Promise<RoleGetResponse>;
  findById(id: string): Promise<Role>;
  update(role: Partial<RoleUpdateParams> & { id: string }): Promise<Role>;
  delete(id: string): Promise<string>;
}

export class RoleRepositoryImpl implements RoleRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private database: Database,
  ) {}

  async create(user: RoleCreateParams): Promise<Role> {
    const roleData = await (await this.roleModel.create(user)).populate('permissions');
    return RoleMapper.toDomain(roleData);
  }

  async find(params: RoleGetQuery): Promise<RoleGetResponse> {
    const {
            page  = 1,
            limit = 10,
            name,
          } = params;

    const filter: Record<string, any> = {};

    const totalCount = await this.roleModel.countDocuments();

    if (name) {
      filter.name = {$regex: name, $options: 'i'};
    }

    const roleDataList = await this.roleModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('permissions')      
      .exec();

    return {
      data: roleDataList.map(roleData =>
        RoleMapper.toDomain(roleData),
      ),
      totalCount: totalCount,
      page,
      limit
    };
  }

  async findById(id: string): Promise<Role> {
    const roleData = await this.roleModel.findById(id).populate('permissions').exec();
    if (!roleData) throw RoleException.RoleNotFound(id);
    return RoleMapper.toDomain(roleData);
  }

  async update(user: RoleUpdateParams): Promise<Role> {
    const roleData = await this.roleModel.findById(user.id);

    if (!roleData) {
      throw RoleException.RoleNotFound(user.id);
    }

    roleData.name = user.name ?? roleData.name;
    roleData.description = user.description ?? roleData.description;
    roleData.permissions = user.permissions ? user.permissions.map(perm => new Types.ObjectId(perm)) : roleData.permissions;
    roleData.updatedAt = new Date() as Date;
    roleData.status = user.status ?? roleData.status;

    await roleData.save();
    return RoleMapper.toDomain(roleData);
  }

  async delete(id: string): Promise<string> {
    await this.roleModel.findByIdAndDelete(id).exec();
    return id;
  }

  private get roleModel(): Model<RoleDocument> {
    return this.database.roleModel();
  }
}
