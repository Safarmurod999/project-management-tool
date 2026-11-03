import { Document, Types } from 'mongoose';

export interface WorkflowStatusDocument extends Document {
  _id: Types.ObjectId;
  workflowId: Types.ObjectId;
  statusId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date | null;
}
