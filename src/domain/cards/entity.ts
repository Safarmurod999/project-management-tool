import { CardStatus } from 'src/infrastructure/common/enum';

export class Card {
  constructor(
    private readonly _id: string,
    private readonly _columnId: string,
    private readonly _title: string,
    private readonly _description: string | null,
    private readonly _order: number,
    private readonly _status: CardStatus,
    private readonly _assigneeId: string | null = null,
    private readonly _assignerId: string | null = null,
    private readonly _points: number = 0,
    private readonly _version: number = 1,
    private readonly _createdAt: Date = new Date(),
    private readonly _updatedAt: Date | null = null,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get columnId(): string {
    return this._columnId;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string | null {
    return this._description;
  }

  public get order(): number {
    return this._order;
  }

  public get status(): CardStatus {
    return this._status;
  }

  public get assigneeId(): string | null {
    return this._assigneeId;
  }

  public get assignerId(): string | null {
    return this._assignerId;
  }

  public get points(): number {
    return this._points;
  }

  public get version(): number {
    return this._version;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date | null {
    return this._updatedAt;
  }
}
