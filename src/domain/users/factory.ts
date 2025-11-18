import { User } from "./entity";

export interface UserStruct {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserFactory {
    create(data: UserStruct): User;
}

export class UserFactoryImpl implements UserFactory {
    create(data: UserStruct): User {
        return new User(
            data.id,
            data.name,
            data.email,
            data.password,
            data.createdAt,
            data.updatedAt,
        );
    }
}