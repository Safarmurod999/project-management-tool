import { Schema } from 'mongoose';

export const ColumnStatusSchema = new Schema(
  {
    // Denormalized from the column so the database can enforce
    // "one status belongs to only one column per board".
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
      required: true,
    },
    statusId: {
      type: Schema.Types.ObjectId,
      ref: 'Status',
      required: true,
      index: true,
    },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

ColumnStatusSchema.index({ boardId: 1, statusId: 1 }, { unique: true });
ColumnStatusSchema.index({ columnId: 1, order: 1 });
