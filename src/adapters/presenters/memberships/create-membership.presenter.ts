import { Membership, MembershipStruct } from 'src/domain';

export interface CreateMembershipPresenter {
  present(membership: Membership): MembershipStruct;
}

export class CreateMembershipPresenterImpl implements CreateMembershipPresenter {
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
