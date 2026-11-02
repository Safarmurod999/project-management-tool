import { Schema } from 'mongoose';

export const ColumnSchema = new Schema(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    name: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);
