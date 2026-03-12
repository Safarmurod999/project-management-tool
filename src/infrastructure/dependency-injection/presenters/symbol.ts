export const PresenterSymbols = {
  User: {
    CreateUserPresenter: Symbol('CreateUserPresenter'),
    FindUserByIdPresenter: Symbol('FindUserByIdPresenter'),
    FindUserByEmailPresenter: Symbol('FindUserByEmailPresenter'),
    UpdateUserPresenter: Symbol('UpdateUserPresenter'),
    DeleteUserPresenter: Symbol('DeleteUserPresenter'),
    GetUsersPresenter: Symbol('GetUsersPresenter'),
  },
  Otp: {
    OtpPresenter: Symbol('OtpPresenter'),
  },
  Auth: {
    RegisterUserPresenter: Symbol('RegisterUserPresenter'),
    VerifyUserPresenter: Symbol('VerifyUserPresenter'),
  },
  Permission: {
    CreatePermissionPresenter: Symbol('CreatePermissionPresenter'),
    FindPermissionByIdPresenter: Symbol('FindPermissionByIdPresenter'),
    GetPermissionsPresenter: Symbol('GetPermissionsPresenter'),
    UpdatePermissionPresenter: Symbol('UpdatePermissionPresenter'),
    DeletePermissionPresenter: Symbol('DeletePermissionPresenter'),
  },
  Role: {
    CreateRolePresenter: Symbol('CreateRolePresenter'),
    FindRoleByIdPresenter: Symbol('FindRoleByIdPresenter'),
    GetRolesPresenter: Symbol('GetRolesPresenter'),
    UpdateRolePresenter: Symbol('UpdateRolePresenter'),
    DeleteRolePresenter: Symbol('DeleteRolePresenter'),
  },
  Membership: {
    CreateMembershipPresenter: Symbol('CreateMembershipPresenter'),
    FindMembershipByIdPresenter: Symbol('FindMembershipByIdPresenter'),
    GetMembershipsPresenter: Symbol('GetMembershipsPresenter'),
    UpdateMembershipPresenter: Symbol('UpdateMembershipPresenter'),
    DeleteMembershipPresenter: Symbol('DeleteMembershipPresenter'),
  },
  Team: {
    CreateTeamPresenter: Symbol('CreateTeamPresenter'),
    FindTeamByIdPresenter: Symbol('FindTeamByIdPresenter'),
    GetTeamsPresenter: Symbol('GetTeamsPresenter'),
    UpdateTeamPresenter: Symbol('UpdateTeamPresenter'), 
    DeleteTeamPresenter: Symbol('DeleteTeamPresenter'),
  },
  Project: {
    CreateProjectPresenter: Symbol('CreateProjectPresenter'),
    FindProjectByIdPresenter: Symbol('FindProjectByIdPresenter'),
    GetProjectsPresenter: Symbol('GetProjectsPresenter'),
    UpdateProjectPresenter: Symbol('UpdateProjectPresenter'),
    DeleteProjectPresenter: Symbol('DeleteProjectPresenter'),
  }
};
