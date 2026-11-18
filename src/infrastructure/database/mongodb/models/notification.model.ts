import { Document, Types } from 'mongoose';
import { NotificationType } from 'src/infrastructure/common/enum';

export interface NotificationDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, string>;
  readAt: Date | null;
  createdAt: Date;
}
