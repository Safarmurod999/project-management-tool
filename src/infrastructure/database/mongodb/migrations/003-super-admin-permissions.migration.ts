import { mongo } from 'mongoose';
import {
  PermissionCode,
  PermissionStatus,
  RoleCode,
} from 'src/infrastructure/common/enum';
import { Database } from 'src/infrastructure/database/database';
import { Logger } from 'src/infrastructure/logger';
import { VerificationResult } from './001-dynamic-statuses.migration';

export const SUPER_ADMIN_PERMISSIONS_MIGRATION_ID =
  '003-super-admin-permissions';

type Collection = mongo.Collection;

const PERMISSIONS: PermissionCode[] = [
  PermissionCode.STATUS_CREATE,
  PermissionCode.STATUS_GET,
  PermissionCode.STATUS_EDIT,
  PermissionCode.STATUS_DELETE,
  PermissionCode.WORKFLOW_CREATE,
  PermissionCode.WORKFLOW_GET,
  PermissionCode.WORKFLOW_EDIT,
  PermissionCode.WORKFLOW_DELETE,
];

export interface SuperAdminPermissionsReport {
  dryRun: boolean;
  permissionsCreated: number;
  rolePermissionsCreated: number;
}

/**
 * Migration 003: creates the `status:*` and `workflow:*` permissions and
 * grants all of them to the super admin role, independently of which other
 * permissions that role holds.
 *
 * Every write is an idempotent upsert, so a partial run is completed by
 * re-running it; no transaction is needed.
 */
export class SuperAdminPermissionsMigration {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  async run(options: {
    dryRun: boolean;
  }): Promise<SuperAdminPermissionsReport> {
    const report: SuperAdminPermissionsReport = {
      dryRun: options.dryRun,
      permissionsCreated: 0,
      rolePermissionsCreated: 0,
    };
    const permissions = this.raw('Permission');
    const rolePermissions = this.raw('RolePermission');
    const superAdmin = await this.raw('Role').findOne({
      code: RoleCode.SUPER_ADMIN,
    });

    if (!superAdmin) {
      this.logger.warn(
        `Role ${RoleCode.SUPER_ADMIN} not found; permissions are granted to no role.`,
      );
    }

    if (options.dryRun) {
      for (const code of PERMISSIONS) {
        const permission = await permissions.findOne({ code });
        if (!permission) {
          report.permissionsCreated += 1;
        }
        const granted =
          permission &&
          superAdmin &&
          (await rolePermissions.findOne({
            roleId: superAdmin._id,
            permissionId: permission._id,
          }));
        if (superAdmin && !granted) {
          report.rolePermissionsCreated += 1;
        }
      }
      return report;
    }

    const now = new Date();
    for (const code of PERMISSIONS) {
      const upsert = await permissions.updateOne(
        { code },
        {
          $setOnInsert: {
            code,
            status: PermissionStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      );
      report.permissionsCreated += upsert.upsertedCount;

      if (!superAdmin) continue;

      const permission = await permissions.findOne({ code });
      if (!permission) continue;

      const grant = await rolePermissions.updateOne(
        { roleId: superAdmin._id, permissionId: permission._id },
        {
          $setOnInsert: {
            roleId: superAdmin._id,
            permissionId: permission._id,
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      );
      report.rolePermissionsCreated += grant.upsertedCount;
    }

    return report;
  }

  async verify(): Promise<VerificationResult> {
    const permissions = this.raw('Permission');
    const rolePermissions = this.raw('RolePermission');
    const superAdmin = await this.raw('Role').findOne({
      code: RoleCode.SUPER_ADMIN,
    });
    const problems: string[] = [];
    let grants = 0;

    if (!superAdmin) {
      problems.push(`role ${RoleCode.SUPER_ADMIN} is missing`);
    }

    for (const code of PERMISSIONS) {
      const permission = await permissions.findOne({ code });
      if (!permission) {
        problems.push(`permission ${code} is missing`);
        continue;
      }
      if (!superAdmin) continue;

      const granted = await rolePermissions.findOne({
        roleId: superAdmin._id,
        permissionId: permission._id,
      });
      if (granted) {
        grants += 1;
      } else {
        problems.push(`role ${RoleCode.SUPER_ADMIN} lacks ${code}`);
      }
    }

    return {
      ok: problems.length === 0,
      problems,
      counts: { superAdminGrants: grants },
    };
  }

  private raw(model: string): Collection {
    return this.database.getClient().model(model)
      .collection as unknown as Collection;
  }
}
