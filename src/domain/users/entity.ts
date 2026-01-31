import { UserStatus } from "src/infrastructure/common/enum";
import { Role } from "../roles";

export class User {
    constructor(
        private readonly _id: string,
        private readonly _name: string,
        private readonly _email: string,
        private readonly _password: string,
        private readonly _role: Role,
        private readonly _isVerified: boolean = false,
        private readonly _createdAt: Date,
        private readonly _updatedAt: Date | null = null,
        private readonly _status: UserStatus = UserStatus.ACTIVE,
    ){}

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get email(): string {        
        return this._email;
    }

    public get password(): string {
        return this._password;
    }

    public get role(): Role {
        return this._role;
    }

    public get isVerified(): boolean {
        return this._isVerified;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date | null {
        return this._updatedAt;
    }

    public get status(): UserStatus {
        return this._status;
    }
}
