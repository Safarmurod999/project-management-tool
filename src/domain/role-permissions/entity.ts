export class RolePermission {
  constructor(
    private readonly _id: string,
    private readonly _roleId: string,
    private readonly _permissionId: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get roleId(): string {
    return this._roleId;
  }

  public get permissionId(): string {
    return this._permissionId;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
