import {
  Global,
  Inject,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailClientImpl } from 'src/adapters';
import {
  AuthConfigImpl,
  EmailClientConfigImpl,
  MongoDbConfigImpl,
  RedisConfigImpl,
} from 'src/config';
import { Cache } from 'src/infrastructure/cache/cache';
import { RedisCache } from 'src/infrastructure/cache/redis/cache';
import { Database } from 'src/infrastructure/database/database';
import { MongoDb } from 'src/infrastructure/database/mongodb/mongo';
import {
  CacheSymbols,
  ClientSymbols,
  ConfigSymbols,
} from 'src/infrastructure/dependency-injection';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';

@Global()
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
    {
      provide: ConfigSymbols.RedisConfig,
      useClass: RedisConfigImpl,
    },
    {
      provide: CacheSymbols.RedisCache,
      useClass: RedisCache,
    },
    {
      provide: ConfigSymbols.EmailClient,
      useClass: EmailClientConfigImpl,
    },
    {
      provide: ClientSymbols.EmailClient,
      useClass: EmailClientImpl,
    },
    {
      provide: ConfigSymbols.AuthConfig,
      useClass: AuthConfigImpl,
    },
  ],
  exports: [
    DatabaseSymbols.MongoDb,
    CacheSymbols.RedisCache,
    ClientSymbols.EmailClient,
    ConfigSymbols.EmailClient,
    ConfigSymbols.AuthConfig,
  ],
})
export class MainConfigModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly mongoDb: Database,

    @Inject(CacheSymbols.RedisCache)
    private readonly redisCache: Cache,
  ) {}

  async onModuleInit() {
    this.mongoDb.connect();

    await this.redisCache.connect();
  }

  async onModuleDestroy() {
    await this.mongoDb.disconnect();

    this.redisCache.disconnect();
  }
}
