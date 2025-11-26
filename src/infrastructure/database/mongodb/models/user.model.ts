import { Document } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}
