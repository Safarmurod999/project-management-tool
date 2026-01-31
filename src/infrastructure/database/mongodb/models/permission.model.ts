import { Document } from 'mongoose';
import { PermissionCode, PermissionStatus } from 'src/infrastructure/common/enum';

export interface PermissionDocument extends Document {
  code: PermissionCode;
  status: PermissionStatus;
  createdAt: Date;
  updatedAt: Date | null;
}
