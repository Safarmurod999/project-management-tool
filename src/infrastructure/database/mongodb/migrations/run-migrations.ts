import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { MongoDbConfigImpl } from 'src/config/mongodb-config';
import { createLogger, LoggerAdapter } from 'src/infrastructure/logger';
import { MongoDb } from '../mongo';
import {
  DynamicStatusesMigration,
  MIGRATION_ID,
  VerificationResult,
} from './001-dynamic-statuses.migration';
import {
  WORKFLOW_PERMISSIONS_MIGRATION_ID,
  WorkflowPermissionsMigration,
} from './002-workflow-permissions.migration';
import {
  SUPER_ADMIN_PERMISSIONS_MIGRATION_ID,
  SuperAdminPermissionsMigration,
} from './003-super-admin-permissions.migration';

interface Migration {
  run(options: { dryRun: boolean }): Promise<object>;
  verify(): Promise<VerificationResult>;
}

/**
 * Usage:
 *   npm run migrate                 # apply pending migrations
 *   npm run migrate -- --dry-run    # print the plan, write nothing
 *   npm run migrate -- --verify     # only check data invariants
 *   npm run migrate -- --only <id>  # limit to one migration, e.g. 003-super-admin-permissions
 *
 * Reads `.env.${NODE_ENV}` (default: development) like the application.
 * `DATABASE_NAME` can be overridden to target a copy of the database.
 */
async function main() {
  const envFile = join(
    process.cwd(),
    `.env.${process.env.NODE_ENV ?? 'development'}`,
  );
  if (existsSync(envFile)) {
    const overrides = { ...process.env };
    process.loadEnvFile(envFile);
    // Explicit environment variables win over the file.
    Object.assign(process.env, overrides);
  }

  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const verifyOnly = args.has('--verify');
  const onlyIndex = process.argv.indexOf('--only');
  const only = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : undefined;

  const logger = new LoggerAdapter(createLogger());
  const database = new MongoDb(new MongoDbConfigImpl());
  database.connect();
  await database.getClient().asPromise();

  const migrations = database.getClient().collection('migrations');
  // Applied in order; each runs once and is recorded in `migrations`.
  const pending: Array<{ id: string; migration: Migration }> = [
    {
      id: MIGRATION_ID,
      migration: new DynamicStatusesMigration(database, logger),
    },
    {
      id: WORKFLOW_PERMISSIONS_MIGRATION_ID,
      migration: new WorkflowPermissionsMigration(database, logger),
    },
    {
      id: SUPER_ADMIN_PERMISSIONS_MIGRATION_ID,
      migration: new SuperAdminPermissionsMigration(database, logger),
    },
  ].filter((item) => !only || item.id === only);

  if (only && pending.length === 0) {
    throw new Error(`Unknown migration: ${only}`);
  }

  try {
    for (const { id, migration } of pending) {
      if (!verifyOnly) {
        const applied = await migrations.findOne({ _id: id as any });

        if (applied) {
          logger.info(
            `${id} already applied at ${applied.appliedAt.toISOString()}`,
          );
        } else {
          const report = await migration.run({ dryRun });
          logger.info(`${id} ${dryRun ? 'plan (dry run)' : 'report'}`, report);

          if (!dryRun) {
            await migrations.insertOne({
              _id: id as any,
              appliedAt: new Date(),
              report,
            });
          }
        }
      }

      if (!dryRun) {
        const result = await migration.verify();
        logger.info(`${id} verification`, result);

        if (!result.ok) {
          process.exitCode = 1;
        }
      }
    }
  } finally {
    await database.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
