import { NotificationType } from 'src/infrastructure/common/enum';

/** Related ids, e.g. `{ cardId, boardId, projectId }`. */
export type NotificationData = Record<string, string>;

export class Notification {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _type: NotificationType,
    private readonly _title: string,
    private readonly _message: string,
    private readonly _data: NotificationData,
    private readonly _readAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  public get id(): string {
    return this._id;
  }

  /** The recipient. */
  public get userId(): string {
    return this._userId;
  }

  public get type(): NotificationType {
    return this._type;
  }

  public get title(): string {
    return this._title;
  }

  public get message(): string {
    return this._message;
  }

  public get data(): NotificationData {
    return this._data;
  }

  public get readAt(): Date | null {
    return this._readAt;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  /** Keeps Socket.IO payloads free of the private `_`-prefixed fields. */
  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      data: this.data,
      readAt: this.readAt,
      createdAt: this.createdAt,
    };
  }
}
