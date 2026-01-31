import { RoleCode, RoleStatus } from "src/infrastructure/common/enum";
import { Permission } from "../permissions";

export class Role {
    constructor(
        private readonly _id: string,
        private readonly _name: RoleCode,
        private readonly _permissions:  Permission[],
        private readonly _createdAt: Date,
        private readonly _updatedAt: Date | null = null,
        private readonly _description?: string,
        private readonly _status: RoleStatus = RoleStatus.ACTIVE,
    ){}

    public get id(): string {
        return this._id;
    }

    public get name(): RoleCode {
        return this._name;
    }

    public get description(): string | undefined {
        return this._description;
    }

    public get permissions(): Permission[] {
        return this._permissions;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date | null {
        return this._updatedAt;
    }

    public get status(): RoleStatus {
        return this._status;
    }
}
