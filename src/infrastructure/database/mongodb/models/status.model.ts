import { Document, Types } from 'mongoose';

export interface StatusDocument extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  name: string;
  code: string;
  color: string;
  order: number;
  isDefault: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}
