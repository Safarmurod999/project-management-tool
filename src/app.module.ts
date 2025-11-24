import { Module } from '@nestjs/common';
import { MongoDbModule, RedisModule, UserModule, CommonModule } from './infrastructure/modules';

@Module({
  imports: [MongoDbModule, RedisModule, UserModule, CommonModule],
})
export class AppModule {}
