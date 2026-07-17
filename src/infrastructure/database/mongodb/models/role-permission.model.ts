import { Document, Types } from 'mongoose';

export interface RolePermissionDocument extends Document {
  roleId: Types.ObjectId;
  permissionId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
