import { Inject, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisConfigImpl } from 'src/config';
import { Cache } from 'src/infrastructure/cache/cache';
import { RedisCache } from 'src/infrastructure/cache/redis/cache';
import { ConfigSymbols, CacheSymbols } from 'src/infrastructure/dependency-injection';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: ConfigSymbols.RedisConfig,
      useClass: RedisConfigImpl,
    },
    {
      provide: CacheSymbols.RedisCache,
      useClass: RedisCache,
    },
  ],
  exports: [CacheSymbols.RedisCache],
})
export class RedisModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(CacheSymbols.RedisCache)
    private readonly redisCache: Cache,
  ) {}

  async onModuleInit() {
    await this.redisCache.connect();
  }

  async onModuleDestroy() {
    await this.redisCache.disconnect();
  }
}
