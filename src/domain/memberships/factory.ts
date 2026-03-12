import { ScopeType } from 'src/infrastructure/common/enum';
import { Membership } from './entity';

export interface MembershipStruct {
  id: string;
  userId: string;
  scopeType: ScopeType;
  scopeId: string;
  roleId: string;
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
      data.createdAt,
      data.updatedAt,
    );
  }
}
