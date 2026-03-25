import { Membership, MembershipStruct } from 'src/domain';

export interface GetTeamMembersPresenter {
  present(memberships: Membership[]): MembershipStruct[];
}

export class GetTeamMembersPresenterImpl implements GetTeamMembersPresenter {
  present(memberships: Membership[]): MembershipStruct[] {
    return memberships.map((membership) => ({
      id: membership.id,
      userId: membership.userId,
      scopeType: membership.scopeType,
      scopeId: membership.scopeId,
      roleId: membership.roleId,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }
}
