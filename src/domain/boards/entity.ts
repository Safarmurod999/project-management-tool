import { BoardStatus } from 'src/infrastructure/common/enum';

export class Board {
  constructor(
    private readonly _id: string,
    private readonly _projectId: string,
    private readonly _name: string,
    private readonly _description: string | null,
    private readonly _status: BoardStatus,
    private readonly _version: number,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date | null = null,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get projectId(): string {
    return this._projectId;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
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