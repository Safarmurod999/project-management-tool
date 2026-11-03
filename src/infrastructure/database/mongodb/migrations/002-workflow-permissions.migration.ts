import { mongo } from 'mongoose';
import {
  PermissionCode,
  PermissionStatus,
} from 'src/infrastructure/common/enum';
import { Database } from 'src/infrastructure/database/database';
import { Logger } from 'src/infrastructure/logger';
import { VerificationResult } from './001-dynamic-statuses.migration';

export const WORKFLOW_PERMISSIONS_MIGRATION_ID = '002-workflow-permissions';

type Collection = mongo.Collection;

/** Each workflow permission is granted to roles holding the matching status permission. */
const WORKFLOW_PERMISSIONS: Array<[PermissionCode, PermissionCode]> = [
  [PermissionCode.STATUS_CREATE, PermissionCode.WORKFLOW_CREATE],
  [PermissionCode.STATUS_GET, PermissionCode.WORKFLOW_GET],
  [PermissionCode.STATUS_EDIT, PermissionCode.WORKFLOW_EDIT],
  [PermissionCode.STATUS_DELETE, PermissionCode.WORKFLOW_DELETE],
];

export interface WorkflowPermissionsReport {
  dryRun: boolean;
  permissionsCreated: number;
  rolePermissionsCreated: number;
}

/**
 * Migration 002: creates the workflow collections' indexes and the
 * `workflow:*` permissions. No workflow data is created: projects without a
 * workflow keep unrestricted card status changes until one is defined.
 *
 * Every write is an idempotent upsert, so a partial run is completed by
 * re-running it; no transaction is needed.
 */
export class WorkflowPermissionsMigration {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  async run(options: { dryRun: boolean }): Promise<WorkflowPermissionsReport> {
    const report: WorkflowPermissionsReport = {
      dryRun: options.dryRun,
      permissionsCreated: 0,
      rolePermissionsCreated: 0,
    };
    const permissions = this.raw('Permission');
    const rolePermissions = this.raw('RolePermission');

    if (options.dryRun) {
      for (const [statusCode, workflowCode] of WORKFLOW_PERMISSIONS) {
        if (!(await permissions.findOne({ code: workflowCode }))) {
          report.permissionsCreated += 1;
        }
        const statusPermission = await permissions.findOne({
          code: statusCode,
        });
        if (statusPermission) {
          report.rolePermissionsCreated += (
            await rolePermissions.distinct('roleId', {
              permissionId: statusPermission._id,
            })
          ).length;
        }
      }
      return report;
    }

    await this.database.workflowModel().createIndexes();
    await this.database.workflowStatusModel().createIndexes();
    await this.database.workflowTransitionModel().createIndexes();

    const now = new Date();
    for (const [statusCode, workflowCode] of WORKFLOW_PERMISSIONS) {
      const upsert = await permissions.updateOne(
        { code: workflowCode },
        {
          $setOnInsert: {
            code: workflowCode,
            status: PermissionStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      );
      report.permissionsCreated += upsert.upsertedCount;

      const workflowPermission = await permissions.findOne({
        code: workflowCode,
      });
      const statusPermission = await permissions.findOne({ code: statusCode });
      if (!workflowPermission || !statusPermission) {
        this.logger.warn(
          `Permission ${statusCode} not found; ${workflowCode} granted to no role.`,
        );
        continue;
      }

      const roleIds = await rolePermissions.distinct('roleId', {
        permissionId: statusPermission._id,
      });
      for (const roleId of roleIds) {
        const grant = await rolePermissions.updateOne(
          { roleId, permissionId: workflowPermission._id },
          {
            $setOnInsert: {
              roleId,
              permissionId: workflowPermission._id,
              createdAt: now,
              updatedAt: now,
            },
          },
          { upsert: true },
        );
        report.rolePermissionsCreated += grant.upsertedCount;
      }
    }

    return report;
  }

  async verify(): Promise<VerificationResult> {
    const permissions = this.raw('Permission');
    const rolePermissions = this.raw('RolePermission');
    const problems: string[] = [];
    let grants = 0;

    for (const [statusCode, workflowCode] of WORKFLOW_PERMISSIONS) {
      const workflowPermission = await permissions.findOne({
        code: workflowCode,
      });
      if (!workflowPermission) {
        problems.push(`permission ${workflowCode} is missing`);
        continue;
      }

      const statusPermission = await permissions.findOne({ code: statusCode });
      if (!statusPermission) continue;

      const expected = await rolePermissions.distinct('roleId', {
        permissionId: statusPermission._id,
      });
      const granted = new Set(
        (
          await rolePermissions.distinct('roleId', {
            permissionId: workflowPermission._id,
          })
        ).map(String),
      );
      grants += granted.size;
      for (const roleId of expected) {
        if (!granted.has(String(roleId))) {
          problems.push(`role ${String(roleId)} lacks ${workflowCode}`);
        }
      }
    }

    return {
      ok: problems.length === 0,
      problems,
      counts: { workflowPermissionGrants: grants },
    };
  }

  private raw(model: string): Collection {
    return this.database.getClient().model(model)
      .collection as unknown as Collection;
  }
}
