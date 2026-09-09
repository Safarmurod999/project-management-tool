import { Schema } from 'mongoose';
import { CardStatus } from 'src/infrastructure/common/enum';

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
    status: {
      type: String,
      enum: Object.values(CardStatus),
      default: CardStatus.TODO,
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
