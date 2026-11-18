import { NotificationType } from 'src/infrastructure/common/enum';
import { NotificationData } from './entity';
import { NotificationException } from './exception';

export interface NotificationStruct {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  readAt: Date | null;
  createdAt: Date;
}

export type NotificationFactoryParams = Pick<
  NotificationStruct,
  'userId' | 'type' | 'title' | 'message'
> & { data?: NotificationData };

export interface NotificationFactory {
  create(data: NotificationFactoryParams): NotificationStruct;
}

export class NotificationFactoryImpl implements NotificationFactory {
  create(data: NotificationFactoryParams): NotificationStruct {
    if (!data.userId) {
      throw NotificationException.InvalidRecipient();
    }

    if (!data.title || data.title.trim().length === 0) {
      throw NotificationException.InvalidTitle();
    }

    return {
      id: '',
      userId: data.userId,
      type: data.type,
      title: data.title.trim(),
      message: data.message.trim(),
      data: data.data ?? {},
      readAt: null,
      createdAt: new Date(),
    };
  }
}
