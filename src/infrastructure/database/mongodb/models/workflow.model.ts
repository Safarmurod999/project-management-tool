import { Document, Types } from 'mongoose';

export interface WorkflowDocument extends Document {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  name: string;
  description: string | null;
  isDefault: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}
