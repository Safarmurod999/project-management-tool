import { Document, Types } from 'mongoose';
import { BoardStatus } from 'src/infrastructure/common/enum';

export interface BoardDocument extends Document {
  projectId: Types.ObjectId;
  name: string;
  description: string | null;
  status: BoardStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date | null;
}