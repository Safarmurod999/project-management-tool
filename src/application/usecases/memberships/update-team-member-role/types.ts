import { Membership } from 'src/domain';

export interface UpdateTeamMemberRoleUsecaseParams {
  teamId: string;
  membershipId: string;
  roleId: string;
}

export interface UpdateTeamMemberRoleUsecase {
  execute(params: UpdateTeamMemberRoleUsecaseParams): Promise<Membership>;
}
