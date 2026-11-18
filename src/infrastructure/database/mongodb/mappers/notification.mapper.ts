import { Notification } from 'src/domain/notifications';
import { NotificationDocument } from '../models';

export class NotificationMapper {
  static toDomain(data: NotificationDocument): Notification {
    return new Notification(
      data._id.toString(),
      data.userId.toString(),
      data.type,
      data.title,
      data.message,
      data.data ?? {},
      data.readAt ?? null,
      data.createdAt,
    );
  }
}
