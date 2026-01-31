import { Document } from "mongoose";
import { PermissionDocument } from "./permission.model";
import { Types } from "mongoose";

export interface RoleDocument extends Document {
  name: string;
  description: string;
  permissions: Types.ObjectId[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
