import { Module } from '@nestjs/common';
import {
  MainConfigModule,
  UserModule,
  OtpModule,
  AuthModule,
    CommonModule
} from './infrastructure/modules';

@Module({
  imports: [MainConfigModule, UserModule, OtpModule, AuthModule, CommonModule],
})
export class AppModule {}
