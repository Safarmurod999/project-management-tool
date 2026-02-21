import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { RolePermissionDocument } from 'src/infrastructure/database/mongodb/models';
import { Permission } from '../permissions';
import { PermissionMapper } from 'src/infrastructure/database/mongodb/mappers';

export interface RolePermissionRepository {
  getPermissionsByRoleId(roleId: string): Promise<Permission[]>;
  assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void>;
  removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void>;
  clearRolePermissions(roleId: string): Promise<void>;
}

@Injectable()
export class RolePermissionRepositoryImpl implements RolePermissionRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private database: Database,
  ) {}

  async getPermissionsByRoleId(roleId: string): Promise<Permission[]> {
    const rolePermissions = await this.rolePermissionModel
      .find({ roleId })
      .populate('permissionId')
      .exec();

    return rolePermissions
      .map((rp) => {
        if (rp.permissionId && typeof rp.permissionId === 'object') {
          return PermissionMapper.toDomain(rp.permissionId as any);
        }
        return null;
      })
      .filter((p): p is Permission => p !== null);
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const operations = permissionIds.map((permissionId) => ({
      updateOne: {
        filter: { roleId, permissionId },
        update: { roleId, permissionId },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await this.rolePermissionModel.bulkWrite(operations);
    }
  }

  async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    await this.rolePermissionModel
      .deleteMany({
        roleId,
        permissionId: { $in: permissionIds },
      })
      .exec();
  }

  async clearRolePermissions(roleId: string): Promise<void> {
    await this.rolePermissionModel.deleteMany({ roleId }).exec();
  }

  private get rolePermissionModel(): Model<RolePermissionDocument> {
    return this.database.rolePermissionModel();
  }
}
