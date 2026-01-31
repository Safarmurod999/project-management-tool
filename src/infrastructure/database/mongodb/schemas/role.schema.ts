import { Schema } from 'mongoose';
export const RoleSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
