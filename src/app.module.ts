import { Module } from '@nestjs/common';
import {
  MainConfigModule,
  UserModule,
  OtpModule,
  AuthModule,
  CommonModule,
  PermissionModule,
  RolesModule,
  TeamsModule,
  ProjectsModule,
  MembershipsModule,
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
    TeamsModule,
    ProjectsModule,
    MembershipsModule,
  ],
})
export class AppModule {
}
