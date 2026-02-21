import { UserStatus } from 'src/infrastructure/common/enum';
import { Role, RoleStruct } from '../roles';
import { User } from './entity';

export interface UserStruct {
  id: string;
  name: string;
  email: string;
  password: string;
  role: RoleStruct;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  status?: UserStatus;
}

export interface UserFactory {
  create(data: UserStruct): User;
}

export class UserFactoryImpl implements UserFactory {
  create(data: UserStruct): User {
    const role = new Role(
      data.role.id,
      data.role.name,
      data.role.code,
      data.role.createdAt,
      data.role.updatedAt,
      data.role.description,
      data.role.status,
    );
    return new User(
      data.id,
      data.email,
      data.password,
      data.name,
      role,
      data.isVerified,
      data.createdAt,
      data.updatedAt,
      data.status,
    );
  }
}
