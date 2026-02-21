import { Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Role } from './entity';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { RoleDocument } from 'src/infrastructure/database/mongodb/models';
import { RoleStruct } from './factory';
import { RoleException } from './exception';
import { RoleMapper } from 'src/infrastructure/database/mongodb/mappers/roles.mapper';
import { RolePermissionRepository } from '../role-permissions';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';

export type RoleCreateParams = Omit<RoleStruct, 'id' | 'createdAt' | 'updatedAt'> & { permissions?: string[] };
export type RoleUpdateParams = Omit<RoleStruct, 'createdAt' | 'updatedAt'> & { permissions?: string[] };

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
  findFirst(): Promise<Role>;
  findById(id: string): Promise<Role>;
  update(role: Partial<RoleUpdateParams> & { id: string }): Promise<Role>;
  delete(id: string): Promise<string>;
}

export class RoleRepositoryImpl implements RoleRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private database: Database,
    @Inject(RepositorySymbols.RolePermissionRepository)
    private rolePermissionRepository: RolePermissionRepository,
  ) {}

  async create(role: RoleCreateParams): Promise<Role> {
    const { permissions, ...roleData } = role;
    const createdRole = await this.roleModel.create(roleData);
    
    // Assign permissions if provided
    if (permissions && permissions.length > 0) {
      await this.rolePermissionRepository.assignPermissionsToRole(
        createdRole._id.toString(),
        permissions,
      );
    }
    
    return RoleMapper.toDomain(createdRole);
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

  async findFirst(): Promise<Role> {
    const roleData = await this.roleModel.findOne().exec();
    if (!roleData) throw RoleException.RoleNotFound();
    return RoleMapper.toDomain(roleData);
  }

  async findById(id: string): Promise<Role> {
    const roleData = await this.roleModel.findById(id).exec();
    if (!roleData) throw RoleException.RoleNotFound(id);
    return RoleMapper.toDomain(roleData);
  }

  async update(role: RoleUpdateParams): Promise<Role> {
    const { permissions, ...updateData } = role;
    const roleData = await this.roleModel.findById(role.id);

    if (!roleData) {
      throw RoleException.RoleNotFound(role.id);
    }

    roleData.name = updateData.name ?? roleData.name;
    roleData.code = updateData.code ?? roleData.code;
    roleData.description = updateData.description ?? roleData.description;
    roleData.updatedAt = new Date() as Date;
    roleData.status = updateData.status ?? roleData.status;

    await roleData.save();
    
    // Update permissions if provided
    if (permissions) {
      await this.rolePermissionRepository.clearRolePermissions(role.id);
      if (permissions.length > 0) {
        await this.rolePermissionRepository.assignPermissionsToRole(
          role.id,
          permissions,
        );
      }
    }
    
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
