import { Document, Types } from "mongoose";
import { RoleDocument } from "./role.model";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: Types.ObjectId;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
