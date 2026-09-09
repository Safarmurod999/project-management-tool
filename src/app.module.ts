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
  ColumnsModule,
  QueueModule,
} from './infrastructure/modules';

@Module({
  imports: [
    MainConfigModule,
    CommonModule,
    QueueModule,
    UserModule,
    OtpModule,
    AuthModule,
    PermissionModule,
    RolesModule,
    RealtimeModule,
    TeamsModule,
    ProjectsModule,
    MembershipsModule,
    BoardsModule,
    ColumnsModule,
  ],
})
export class AppModule {}
