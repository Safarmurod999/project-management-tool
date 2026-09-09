import { Document, Types } from 'mongoose';
import { BoardStatus } from 'src/infrastructure/common/enum';

export interface ColumnDocument extends Document {
  _id: Types.ObjectId;
  boardId: Types.ObjectId;
  name: string;
  order: number;
  status: BoardStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
