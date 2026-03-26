import { Membership, MembershipStruct } from 'src/domain';

export interface FindMembershipByIdPresenter {
  present(membership: Membership): MembershipStruct;
}

export class FindMembershipByIdPresenterImpl implements FindMembershipByIdPresenter {
  present(membership: Membership): MembershipStruct {
    return {
      id: membership.id,
      userId: membership.userId,
      scopeType: membership.scopeType,
      scopeId: membership.scopeId,
      roleId: membership.roleId,
      override: membership.override,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }
}
