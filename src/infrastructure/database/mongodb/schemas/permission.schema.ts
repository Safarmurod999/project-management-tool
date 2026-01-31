import { Schema } from 'mongoose';
import { PermissionCode, PermissionStatus } from 'src/infrastructure/common/enum';

export const PermissionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      enum: Object.values(PermissionCode),
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(PermissionStatus),
      default: PermissionStatus.ACTIVE,
      required: true,
    },
  },
  { timestamps: true },
);
