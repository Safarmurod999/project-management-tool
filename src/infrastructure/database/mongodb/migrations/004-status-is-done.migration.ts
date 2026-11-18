import { mongo } from 'mongoose';
import { CardStatus } from 'src/infrastructure/common/enum';
import { Database } from 'src/infrastructure/database/database';
import { Logger } from 'src/infrastructure/logger';
import { VerificationResult } from './001-dynamic-statuses.migration';

export const STATUS_IS_DONE_MIGRATION_ID = '004-status-is-done';

type Collection = mongo.Collection;

export interface StatusIsDoneReport {
  dryRun: boolean;
  /** Statuses with code `done` that were marked as done. */
  markedDone: number;
  /** All other statuses that received `isDone: false`. */
  markedNotDone: number;
}

/**
 * Migration 004: adds `isDone` to every existing status. Statuses with the
 * seeded `done` code become done statuses (matching what new projects get);
 * all others are not done. Statuses that already have `isDone` are left as is.
 *
 * Each write only touches statuses without the field, so a partial run is
 * completed by re-running it; no transaction is needed.
 */
export class StatusIsDoneMigration {
  constructor(
    private readonly database: Database,
    private readonly logger: Logger,
  ) {}

  async run(options: { dryRun: boolean }): Promise<StatusIsDoneReport> {
    const statuses = this.raw('Status');
    const doneFilter = { isDone: { $exists: false }, code: CardStatus.DONE };
    const otherFilter = {
      isDone: { $exists: false },
      code: { $ne: CardStatus.DONE },
    };

    if (options.dryRun) {
      return {
        dryRun: true,
        markedDone: await statuses.countDocuments(doneFilter),
        markedNotDone: await statuses.countDocuments(otherFilter),
      };
    }

    const done = await statuses.updateMany(doneFilter, {
      $set: { isDone: true },
    });
    const other = await statuses.updateMany(otherFilter, {
      $set: { isDone: false },
    });

    this.logger.info(
      `${STATUS_IS_DONE_MIGRATION_ID}: ${done.modifiedCount} done, ${other.modifiedCount} not done`,
    );

    return {
      dryRun: false,
      markedDone: done.modifiedCount,
      markedNotDone: other.modifiedCount,
    };
  }

  async verify(): Promise<VerificationResult> {
    const statuses = this.raw('Status');
    const missing = await statuses.countDocuments({
      isDone: { $not: { $type: 'bool' } },
    });
    const done = await statuses.countDocuments({ isDone: true });

    return {
      ok: missing === 0,
      problems:
        missing === 0 ? [] : [`${missing} statuses have no boolean isDone`],
      counts: { doneStatuses: done, statusesWithoutIsDone: missing },
    };
  }

  private raw(model: string): Collection {
    return this.database.getClient().model(model)
      .collection as unknown as Collection;
  }
}
