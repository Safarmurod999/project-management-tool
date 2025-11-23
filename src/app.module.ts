import { Module } from '@nestjs/common';
import { MongoDbModule, RedisModule, UserModule } from './infrastructure/modules';

@Module({
  imports: [MongoDbModule, RedisModule, UserModule],
})
export class AppModule {}
