import { Document, Types } from "mongoose";
import { UserDocument } from "./user.model";
import { TeamStatus } from "src/infrastructure/common/enum";

export interface TeamDocument extends Document {
  name: string;
  description: string | null;
  members: Types.ObjectId[] | UserDocument[];
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date | null;
  status: TeamStatus;
}
