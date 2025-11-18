export class User {
    constructor(
        private readonly _id: string,
        private readonly _name: string,
        private readonly _email: string,
        private readonly _password: string,
        private readonly _createdAt: Date,
        private readonly _updatedAt: Date,
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

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }
}