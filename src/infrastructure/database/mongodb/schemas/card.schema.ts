import { Schema } from 'mongoose';

export const CardSchema = new Schema(
  {
    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: null },
    order: { type: Number, required: true, default: 0 },
    statusId: {
      type: Schema.Types.ObjectId,
      ref: 'Status',
      required: true,
      index: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    points: { type: Number, default: 0, min: 0 },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);
