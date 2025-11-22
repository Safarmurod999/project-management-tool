import { Module } from '@nestjs/common';
import { MongoDbModule, UserModule } from './infrastructure/modules';

@Module({
  imports: [MongoDbModule, UserModule],
})
export class AppModule {}
