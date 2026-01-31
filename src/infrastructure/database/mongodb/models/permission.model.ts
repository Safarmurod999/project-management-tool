import { Document } from "mongoose";

export interface PermissionDocument extends Document {
  name: string;
  description: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
