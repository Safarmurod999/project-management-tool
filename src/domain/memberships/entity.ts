import { RoleCode, ScopeType } from 'src/infrastructure/common/enum';

export class Membership {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _scopeType: ScopeType,
    private readonly _scopeId: string,
    private readonly _roleId: string,
    private readonly _override: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date | null = null,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get scopeType(): ScopeType {
    return this._scopeType;
  }

  public get scopeId(): string {
    return this._scopeId;
  }

  public get roleId(): string {
    return this._roleId;
  }

  public get override(): boolean {
    return this._override;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date | null {
    return this._updatedAt;
  }
}

export class MembershipDetails {
  constructor(
    public readonly id: string,
    public readonly user: {
      name: string;
      email: string;
    },
    public readonly role: {
      name: string;
      code: RoleCode;
      description: string;
    },
    public readonly scopeType: ScopeType,
    public readonly scopeId: string,
    public readonly override: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
  ) {}
}
