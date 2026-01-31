import { Schema } from 'mongoose';
export const PermissionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, required: false, default: true}
  },
  { timestamps: true },
);
