import { Document, Types } from 'mongoose';

export interface WorkflowTransitionDocument extends Document {
  _id: Types.ObjectId;
  workflowId: Types.ObjectId;
  fromStatusId: Types.ObjectId;
  toStatusId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date | null;
}
