import { Module } from '@nestjs/common';
import { MongoDbModule, RedisModule, UserModule } from './infrastructure/modules';
import {CommonModule} from "./infrastructure/modules/common/common.module";

@Module({
  imports: [MongoDbModule, RedisModule, UserModule, CommonModule],
})
export class AppModule {}
