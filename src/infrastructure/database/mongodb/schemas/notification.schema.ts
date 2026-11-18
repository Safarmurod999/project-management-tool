import { Schema } from 'mongoose';
import { NotificationType } from 'src/infrastructure/common/enum';

export const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null },
  },
  // Notifications never change apart from `readAt`, so only `createdAt` is kept.
  // `minimize: false` stores an empty `data` as `{}` instead of dropping it.
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false },
);

// The feed (newest first) and the unread count, both per recipient.
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, readAt: 1 });
