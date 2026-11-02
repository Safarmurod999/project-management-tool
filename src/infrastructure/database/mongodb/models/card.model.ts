import { Document, Types } from 'mongoose';

export interface CardDocument extends Document {
  _id: Types.ObjectId;
  columnId: Types.ObjectId;
  title: string;
  description: string | null;
  order: number;
  statusId: Types.ObjectId;
  assigneeId: Types.ObjectId | null;
  assignerId: Types.ObjectId | null;
  points: number;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}
