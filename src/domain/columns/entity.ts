import { BoardStatus } from 'src/infrastructure/common/enum';

export class Column {
  constructor(
    private readonly _id: string,
    private readonly _boardId: string,
    private readonly _name: string,
    private readonly _order: number,
    private readonly _status: BoardStatus,
    private readonly _version: number,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date | null = null,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get boardId(): string {
    return this._boardId;
  }

  public get name(): string {
    return this._name;
  }

  public get order(): number {
    return this._order;
  }

  public get status(): BoardStatus {
    return this._status;
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
