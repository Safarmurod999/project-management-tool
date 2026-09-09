import { Document, Types } from 'mongoose';
import { CardStatus } from 'src/infrastructure/common/enum';

export interface CardDocument extends Document {
  _id: Types.ObjectId;
  columnId: Types.ObjectId;
  title: string;
  description: string | null;
  order: number;
  status: CardStatus;
  assigneeId: Types.ObjectId | null;
  assignerId: Types.ObjectId | null;
  points: number;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}
