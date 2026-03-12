import { TeamStatus } from "src/infrastructure/common/enum";
import { User } from "../users";

export class Team {
    constructor(
        private readonly _id: string,
        private readonly _name: string,
        private readonly _description: string | null,
        private readonly _ownerId: string,
        private readonly _createdAt: Date,
        private readonly _updatedAt: Date | null = null,
        private readonly _status: TeamStatus = TeamStatus.ACTIVE,
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

    public get ownerId(): string {
        return this._ownerId;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date | null {
        return this._updatedAt;
    }

    public get status(): TeamStatus {
        return this._status;
    }
}
