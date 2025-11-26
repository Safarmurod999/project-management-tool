import { Module } from '@nestjs/common';
import {
  MainConfigModule,
  UserModule,
  OtpModule,
  AuthModule,
} from './infrastructure/modules';

@Module({
  imports: [MainConfigModule, UserModule, OtpModule, AuthModule],
})
export class AppModule {}
