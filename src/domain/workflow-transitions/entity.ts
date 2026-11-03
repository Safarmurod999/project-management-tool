/**
 * A one-way rule allowing cards to move from `fromStatusId` to `toStatusId`.
 * A two-way transition is stored as two rules, one per direction.
 */
export class WorkflowTransition {
  constructor(
    private readonly _id: string,
    private readonly _workflowId: string,
    private readonly _fromStatusId: string,
    private readonly _toStatusId: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date | null = null,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get workflowId(): string {
    return this._workflowId;
  }

  public get fromStatusId(): string {
    return this._fromStatusId;
  }

  public get toStatusId(): string {
    return this._toStatusId;
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
      workflowId: this.workflowId,
      fromStatusId: this.fromStatusId,
      toStatusId: this.toStatusId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
