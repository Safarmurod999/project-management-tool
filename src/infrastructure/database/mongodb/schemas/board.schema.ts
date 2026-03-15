import { Schema } from 'mongoose';
import { BoardStatus } from 'src/infrastructure/common/enum';

export const BoardSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(BoardStatus),
      default: BoardStatus.ACTIVE,
    },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);