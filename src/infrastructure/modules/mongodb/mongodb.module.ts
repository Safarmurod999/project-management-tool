import { Inject, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDbConfigImpl } from 'src/config';
import { Database } from 'src/infrastructure/database/database';
import { MongoDb } from 'src/infrastructure/database/mongodb/mongo';
import { ConfigSymbols } from 'src/infrastructure/dependency-injection';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: ConfigSymbols.MongoDbConfig,
      useClass: MongoDbConfigImpl,
    },
    {
      provide: DatabaseSymbols.MongoDb,
      useFactory: (config: MongoDbConfigImpl) => {
        return new MongoDb(config);
      },
      inject: [ConfigSymbols.MongoDbConfig],
    },
  ],
  exports: [DatabaseSymbols.MongoDb],
})
export class MongoDbModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly mongoDb: Database,
  ) {}

  async onModuleInit() {
    await this.mongoDb.connect();
  }

  async onModuleDestroy() {
    await this.mongoDb.disconnect();
  }
}
