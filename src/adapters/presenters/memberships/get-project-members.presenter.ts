import { MembershipDetails, MembershipDetailsStruct } from "src/domain";

export interface GetProjectMembersPresenter {
  present(memberships: MembershipDetails[]): MembershipDetailsStruct[];
}

export class GetProjectMembersPresenterImpl implements GetProjectMembersPresenter {
  present(memberships: MembershipDetails[]): MembershipDetailsStruct[] {
    
    return memberships.map((membership) => ({
      id: membership.id,
      user: {
        email: membership.user.email,
        name: membership.user.name,
      },
      role: {
        name: membership.role.name,
        description: membership.role.description,
        code: membership.role.code,
      },
      scopeType: membership.scopeType,
      scopeId: membership.scopeId,
      override: membership.override,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    }));
  }
}
