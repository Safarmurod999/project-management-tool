import { ScopeType } from 'src/infrastructure/common/enum';
import { Membership } from './entity';
import { UserStruct } from '../users';
import { RoleStruct } from '../roles';

export interface MembershipStruct {
  id: string;
  userId: string;
  scopeType: ScopeType;
  scopeId: string;
  roleId: string;
  override: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

type User = Pick<UserStruct, 'name' | 'email'>;
type Role = Pick<RoleStruct, 'name' | 'code' | 'description'>;

export interface MembershipDetailsStruct {
  id: string;
  user: User;
  role: Role;
  scopeType: ScopeType;
  scopeId: string;
  override: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface MembershipFactory {
  create(data: MembershipStruct): Membership;
}

export class MembershipFactoryImpl implements MembershipFactory {
  create(data: MembershipStruct): Membership {
    return new Membership(
      data.id,
      data.userId,
      data.scopeType,
      data.scopeId,
      data.roleId,
      data.override,
      data.createdAt,
      data.updatedAt,
    );
  }
}
