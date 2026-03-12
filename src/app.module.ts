import { Module } from '@nestjs/common';
import {
  MainConfigModule,
  UserModule,
  OtpModule,
  AuthModule,
  CommonModule,
  PermissionModule,
  RolesModule,
  RealtimeModule,
} from './infrastructure/modules';

@Module({
  imports: [
    MainConfigModule,
    UserModule,
    OtpModule,
    AuthModule,
    CommonModule,
    PermissionModule,
    RolesModule,
    RealtimeModule,
  ],
})
export class AppModule {
}
