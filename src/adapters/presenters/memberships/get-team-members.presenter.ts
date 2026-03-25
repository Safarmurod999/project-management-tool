// import { Membership, MembershipStruct } from 'src/domain';

export interface GetTeamMembersPresenter {
  present(memberships);
}

export class GetTeamMembersPresenterImpl implements GetTeamMembersPresenter {
  present(memberships){    
    return memberships.map((membership) => ({
      id: membership._id,
      user: {
        email: membership.user.email,
        name: membership.user.name, 
        status: membership.user.status, 
      },
      role: {
        name: membership.role.name,
        description: membership.role.description,
        code: membership.role.code,
      },
      scopeType: membership._scopeType,
      scopeId: membership._scopeId,
      createdAt: membership._createdAt,
      updatedAt: membership._updatedAt,
    }));
  }
}
