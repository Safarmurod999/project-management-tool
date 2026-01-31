import { Role } from "../roles";
import { User } from "./entity";
    
export interface UserStruct {
    id: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date | null;
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
            data.role,
            data.isVerified,
            data.createdAt,
            data.updatedAt,
        );
    }
}
