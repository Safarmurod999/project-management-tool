import { Schema } from 'mongoose';
import { RoleCode, RoleStatus } from 'src/infrastructure/common/enum';
export const RoleSchema = new Schema(
  {
    name: { type: String, required: true, enum: Object.values(RoleCode), unique: true },
    description: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    status: { type: String, enum: Object.values(RoleStatus), default: RoleStatus.ACTIVE },
  },
  { timestamps: true },
);
