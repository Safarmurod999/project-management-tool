import { Document, Types } from "mongoose";
import { TeamStatus } from "src/infrastructure/common/enum";

export interface TeamDocument extends Document {
  name: string;
  description: string | null;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date | null;
  status: TeamStatus;
}
