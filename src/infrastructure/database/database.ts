import { Connection, Model } from 'mongoose';
import {
  PermissionDocument,
  ProjectDocument,
  RoleDocument,
  RolePermissionDocument,
  TeamDocument,
  UserDocument,
} from './mongodb/models';

export interface Database {
  getClient(): Connection;
  connect(): void;
  disconnect(): Promise<void>;

  userModel(): Model<UserDocument>;
  permissionModel(): Model<PermissionDocument>;
  roleModel(): Model<RoleDocument>;
  rolePermissionModel(): Model<RolePermissionDocument>;
  teamModel(): Model<TeamDocument>;
  projectModel(): Model<ProjectDocument>;
}
