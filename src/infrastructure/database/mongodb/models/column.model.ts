import { Document, Types } from 'mongoose';

export interface ColumnDocument extends Document {
  _id: Types.ObjectId;
  boardId: Types.ObjectId;
  name: string;
  order: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
