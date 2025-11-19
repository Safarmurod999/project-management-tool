import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoDbModule, UserModule } from './infrastructure/modules';

@Module({
  imports: [MongoDbModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
