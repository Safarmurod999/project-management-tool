export const PresenterSymbols = {
  User: {
    CreateUserPresenter: Symbol('CreateUserPresenter'),
    FindUserByIdPresenter: Symbol('FindUserByIdPresenter'),
    FindUserByEmailPresenter: Symbol('FindUserByEmailPresenter'),
    UpdateUserPresenter: Symbol('UpdateUserPresenter'),
    DeleteUserPresenter: Symbol('DeleteUserPresenter'),
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
};
