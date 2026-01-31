import { PermissionCode, PermissionStatus } from "src/infrastructure/common/enum";

export class Permission {
    constructor(
        private readonly _id: string,
        private readonly _code: PermissionCode,
        private readonly _createdAt: Date,
        private readonly _updatedAt: Date | null = null,
        private readonly _status: PermissionStatus = PermissionStatus.ACTIVE,
    ){}

    public get id(): string {
        return this._id;
    }

    public get code(): PermissionCode {
        return this._code;
    }

    public get status(): PermissionStatus {
        return this._status;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date | null {
        return this._updatedAt;
    }
}
