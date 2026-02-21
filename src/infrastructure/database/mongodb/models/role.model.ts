import { Document } from "mongoose";
import { RoleCode, RoleStatus } from "src/infrastructure/common/enum";

export interface RoleDocument extends Document {
  name: string;
  code: RoleCode;
  description: string;
  status?: RoleStatus;
  createdAt: Date;
  updatedAt: Date | null;
}
