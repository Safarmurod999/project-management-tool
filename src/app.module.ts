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
  CardsModule,
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
    CardsModule,
  ],
})
export class AppModule {}
