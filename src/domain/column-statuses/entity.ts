export class ColumnStatus {
  constructor(
    private readonly _id: string,
    private readonly _columnId: string,
    private readonly _statusId: string,
    private readonly _order: number,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date | null = null,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get columnId(): string {
    return this._columnId;
  }

  public get statusId(): string {
    return this._statusId;
  }

  public get order(): number {
    return this._order;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date | null {
    return this._updatedAt;
  }
}
