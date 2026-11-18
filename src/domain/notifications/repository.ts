import { Inject } from '@nestjs/common';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Database } from 'src/infrastructure/database/database';
import { DatabaseSymbols } from 'src/infrastructure/dependency-injection/databases/symbol';
import { NotificationDocument } from 'src/infrastructure/database/mongodb/models';
import { NotificationMapper } from 'src/infrastructure/database/mongodb/mappers';
import { Notification } from './entity';
import { NotificationStruct } from './factory';
import { NotificationException } from './exception';

export type NotificationCreateParams = Omit<
  NotificationStruct,
  'id' | 'readAt' | 'createdAt'
>;

export interface NotificationGetQuery {
  userId: string;
  page?: number;
  limit?: number;
  /** When true, only unread notifications are returned. */
  unread?: boolean;
}

export interface NotificationGetResponse {
  data: Notification[];
  page: number;
  limit: number;
  totalCount: number;
  /** Unread notifications of the user, independent of the `unread` filter. */
  unreadCount: number;
}

export interface NotificationRepository {
  create(notification: NotificationCreateParams): Promise<Notification>;
  /** The user's notifications, newest first. */
  findByUserId(params: NotificationGetQuery): Promise<NotificationGetResponse>;
  /**
   * Sets `readAt` (kept if already read). Throws 404 unless the notification
   * belongs to `userId`.
   */
  markAsRead(id: string, userId: string): Promise<Notification>;
  /** Marks every unread notification of the user as read; returns how many. */
  markAllAsRead(userId: string): Promise<number>;
}

export class NotificationRepositoryImpl implements NotificationRepository {
  constructor(
    @Inject(DatabaseSymbols.MongoDb)
    private readonly database: Database,
  ) {}

  async create(notification: NotificationCreateParams): Promise<Notification> {
    const notificationData = await this.notificationModel.create({
      ...notification,
      userId: new Types.ObjectId(notification.userId),
      readAt: null,
    });

    return NotificationMapper.toDomain(notificationData);
  }

  async findByUserId(
    params: NotificationGetQuery,
  ): Promise<NotificationGetResponse> {
    const { page = 1, limit = 10, userId, unread } = params;
    const userFilter = { userId: new Types.ObjectId(userId) };
    const filter = unread ? { ...userFilter, readAt: null } : userFilter;

    const [totalCount, unreadCount, notificationDataList] = await Promise.all([
      this.notificationModel.countDocuments(filter).exec(),
      this.notificationModel
        .countDocuments({ ...userFilter, readAt: null })
        .exec(),
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    return {
      data: notificationDataList.map((item) =>
        NotificationMapper.toDomain(item),
      ),
      page,
      limit,
      totalCount,
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    // Another user's notification is reported as missing, not as forbidden.
    if (!isValidObjectId(id)) {
      throw NotificationException.NotificationNotFound(id);
    }

    const owned = {
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    };

    const updated = await this.notificationModel
      .findOneAndUpdate(
        { ...owned, readAt: null },
        { $set: { readAt: new Date() } },
        { new: true },
      )
      .exec();

    const notificationData =
      updated ?? (await this.notificationModel.findOne(owned).exec());

    if (!notificationData) {
      throw NotificationException.NotificationNotFound(id);
    }

    return NotificationMapper.toDomain(notificationData);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany(
        { userId: new Types.ObjectId(userId), readAt: null },
        { $set: { readAt: new Date() } },
      )
      .exec();

    return result.modifiedCount;
  }

  private get notificationModel(): Model<NotificationDocument> {
    return this.database.notificationModel();
  }
}
