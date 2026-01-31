import { UserStatus } from 'src/infrastructure/common/enum';
import { Role, RoleStruct } from '../roles';
import { User } from './entity';
import { Permission } from '../permissions';

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
    const permissions = data.role.permissions.map(
      (p) => new Permission(p.id, p.code, p.createdAt, p.updatedAt, p.status),
    );

    const role = new Role(
      data.role.id,
      data.role.name,
      permissions,
      data.role.createdAt,
      data.role.updatedAt,
      data.role.status,
    );
    return new User(
      data.id,
      data.name,
      data.email,
      data.password,
      role,
      data.isVerified,
      data.createdAt,
      data.updatedAt,
      data.status,
    );
  }
}
