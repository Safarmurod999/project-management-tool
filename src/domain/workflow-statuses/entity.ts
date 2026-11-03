/** A Status that is available in a Workflow. */
export class WorkflowStatus {
  constructor(
    private readonly _id: string,
    private readonly _workflowId: string,
    private readonly _statusId: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date | null = null,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get workflowId(): string {
    return this._workflowId;
  }

  public get statusId(): string {
    return this._statusId;
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
      statusId: this.statusId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
