import { Document } from "mongoose";
import { Types } from "mongoose";
import { RoleCode, RoleStatus } from "src/infrastructure/common/enum";

export interface RoleDocument extends Document {
  name: RoleCode;
  description: string;
  permissions: Types.ObjectId[];
  status?: RoleStatus;
  createdAt: Date;
  updatedAt: Date | null;
}
