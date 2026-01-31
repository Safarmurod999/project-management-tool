import { Inject } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Permission } from './entity';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { PermissionDocument } from 'src/infrastructure/database/mongodb/models';
import { FactorySymbols } from 'src/infrastructure/dependency-injection';
import { PermissionFactory, PermissionStruct } from './factory';
import { PermissionException } from './exception';

export type PermissionCreateParams = Omit<PermissionStruct, 'id' | 'createdAt' | 'updatedAt'>;
export type PermissionUpdateParams = Omit<PermissionStruct, 'createdAt' | 'updatedAt'>;

export interface PermissionsGetQuery {
  page?: number;
  limit?: number;
  name?: string;
}

export interface PermissionGetResponse {
  data: Permission[];
  totalCount: number;
}

export interface PermissionRepository {
  create(permission: PermissionCreateParams): Promise<Permission>;

  findById(id: string): Promise<Permission>;

  getAll(params: PermissionsGetQuery): Promise<PermissionGetResponse>;

  update(permission: Partial<PermissionUpdateParams>): Promise<Permission>;

  delete(id: string): Promise<string>;
}

export class PermissionRepositoryImpl implements PermissionRepository {
  constructor(
    @Inject(FactorySymbols.PermissionFactory)
    private permissionFactory: PermissionFactory,
    @Inject(DatabaseSymbols.MongoDb)
    private database: Database,
  ) {}

  async create(user: PermissionCreateParams): Promise<Permission> {
    const permissionData = await this.permissionModel.create(user);
    return this.toEntity(permissionData);
  }

  async findById(id: string): Promise<Permission> {
    const permissionData = await this.permissionModel.findById(id).exec();

    if (!permissionData) throw PermissionException.PermissionNotFound(id);
    return this.toEntity(permissionData);
  }

  async getAll(params: PermissionsGetQuery): Promise<PermissionGetResponse> {
    const {
            page  = 1,
            limit = 10,
            name,
          } = params;

    const totalCount = await this.permissionModel.countDocuments();

    const filter: Record<string, any> = {};

    if (name) {
      filter.name = {$regex: name, $options: 'i'};
    }

    const permissionDataList = await this.permissionModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data: permissionDataList.map(permissionData =>
        this.toEntity(permissionData),
      ),
      totalCount,
    };
  }

  async update(user: PermissionUpdateParams): Promise<Permission> {
    const permissionData = await this.permissionModel.findById(user.id);

    if (!permissionData) {
      throw PermissionException.PermissionNotFound(user.id);
    };

    console.log(permissionData);
    

    permissionData.name = user.name ?? permissionData.name;
    permissionData.description = user.description ?? permissionData.description;
    permissionData.updatedAt = new Date() as Date;
    permissionData.isActive = user.isActive ?? permissionData.isActive;

    await permissionData.save();
    return this.toEntity(permissionData);
  }

  async delete(id: string): Promise<string> {
    await this.permissionModel.findByIdAndDelete(id).exec();
    return id;
  }

  private get permissionModel(): Model<PermissionDocument> {
    return this.database.permissionModel();
  }

  private toEntity(model: PermissionDocument): Permission {
    return this.permissionFactory.create({
      id: model.id,
      name: model.name,
      description: model.description || '',
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
