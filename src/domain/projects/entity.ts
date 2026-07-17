import { ProjectStatus } from 'src/infrastructure/common/enum';

export class Project {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _description: string | null,
    private readonly _teamId: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date | null = null,
    private readonly _status: ProjectStatus = ProjectStatus.ACTIVE,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string | null {
    return this._description;
  }

  public get teamId(): string {
    return this._teamId;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date | null {
    return this._updatedAt;
  }

  public get status(): ProjectStatus {
    return this._status;
  }
}
