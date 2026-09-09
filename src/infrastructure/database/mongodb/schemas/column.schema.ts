import { Schema } from 'mongoose';
import { BoardStatus } from 'src/infrastructure/common/enum';

export const ColumnSchema = new Schema(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    name: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: Object.values(BoardStatus),
      default: BoardStatus.ACTIVE,
    },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);
