import { Inject, Injectable } from '@nestjs/common';
import { TransactionManager } from 'src/application/services/transaction-manager';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { CommonSymbols } from 'src/infrastructure/dependency-injection/common/symbol';
import { Logger } from 'src/infrastructure/logger';

/**
 * MongoDB transactions require a replica set or sharded cluster. Production
 * (Atlas) supports them; a standalone local `mongod` does not. On a standalone
 * server the work still runs, just without atomicity, and a warning is logged
 * once so the degraded mode is visible.
 */
@Injectable()
export class MongoTransactionManager implements TransactionManager {
  private supported: boolean | null = null;

  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
    @Inject(CommonSymbols.Logger)
    private readonly logger: Logger,
  ) {}

  async run<T>(work: () => Promise<T>): Promise<T> {
    if (!(await this.isSupported())) {
      return work();
    }

    // Sessions are propagated through mongoose's transactionAsyncLocalStorage.
    return this.database.getClient().transaction(() => work());
  }

  private async isSupported(): Promise<boolean> {
    if (this.supported !== null) {
      return this.supported;
    }

    const client = this.database.getClient();
    await client.asPromise();
    const hello = await client.db!.admin().command({ hello: 1 });
    this.supported = Boolean(hello.setName) || hello.msg === 'isdbgrid';

    if (!this.supported) {
      this.logger.warn(
        'MongoDB is running standalone: multi-document transactions are disabled. Use a replica set to enable them.',
      );
    }

    return this.supported;
  }
}
