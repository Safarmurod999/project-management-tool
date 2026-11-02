import { Document, Types } from 'mongoose';

export interface ColumnStatusDocument extends Document {
  _id: Types.ObjectId;
  boardId: Types.ObjectId;
  columnId: Types.ObjectId;
  statusId: Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date | null;
}
