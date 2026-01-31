import { Module } from '@nestjs/common';
import {
  MainConfigModule,
  UserModule,
  OtpModule,
  AuthModule,
  CommonModule,
  PermissionModule,
  RolesModule
} from './infrastructure/modules';

@Module({
  imports: [MainConfigModule, UserModule, OtpModule, AuthModule, CommonModule, PermissionModule, RolesModule],
})
export class AppModule {
}
