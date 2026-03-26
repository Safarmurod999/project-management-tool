import { Membership, MembershipStruct } from 'src/domain';

export interface GetMembershipsPresenter {
  present(memberships: Membership[]): MembershipStruct[];
}

export class GetMembershipsPresenterImpl implements GetMembershipsPresenter {
  present(memberships: Membership[]): MembershipStruct[] {
    return memberships.map((membership) => ({
      id: membership.id,
      userId: membership.userId,
      scopeType: membership.scopeType,
      scopeId: membership.scopeId,
      roleId: membership.roleId,
      override: membership.override,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }
}
