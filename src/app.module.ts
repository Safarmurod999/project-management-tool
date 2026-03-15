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
  TeamsModule,
  ProjectsModule,
  MembershipsModule,
  BoardsModule,
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
    TeamsModule,
    ProjectsModule,
    MembershipsModule,
    BoardsModule,
  ],
})
export class AppModule {
}
