export class Status {
  constructor(
    private readonly _id: string,
    private readonly _projectId: string,
    private readonly _name: string,
    private readonly _code: string,
    private readonly _color: string,
    private readonly _order: number,
    private readonly _isDefault: boolean,
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

  public get code(): string {
    return this._code;
  }

  public get color(): string {
    return this._color;
  }

  public get order(): number {
    return this._order;
  }

  public get isDefault(): boolean {
    return this._isDefault;
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

  /** Keeps Socket.IO payloads free of the private `_`-prefixed fields. */
  public toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      name: this.name,
      code: this.code,
      color: this.color,
      order: this.order,
      isDefault: this.isDefault,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
