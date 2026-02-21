export const UsecaseSymbols = {
  User: {
    CreateUserUsecase: Symbol.for('CreateUserUsecase'),
    FindUserByIdUsecase: Symbol.for('FindUserByIdUsecase'),
    FindUserByEmailUsecase: Symbol.for('FindUserByEmailUsecase'),
    UpdateUserUsecase: Symbol.for('UpdateUserUsecase'),
    DeleteUserUsecase: Symbol.for('DeleteUserUsecase'),
    GetUsersUsecase: Symbol.for('GetUsersUsecase'),
  },
  Otp: {
    SendOtpUsecase: Symbol.for('SendOtpUsecase'),
    VerifyOtpUsecase: Symbol.for('VerifyOtpUsecase'),
  },
  Auth: {
    RegisterUserUsecase: Symbol.for('RegisterUserUsecase'),
    VerifyUserUsecase: Symbol.for('VerifyUserUsecase'),
    LoginUserUsecase: Symbol.for('LoginUserUsecase'),
    RefreshTokenUsecase: Symbol.for('RefreshTokenUsecase'),
    GetMeUsecase: Symbol.for('GetMeUsecase'),
  },
  Permission: {
    CreatePermissionUsecase: Symbol.for('CreatePermissionUsecase'),
    GetPermissionsUsecase: Symbol.for('GetPermissionsUsecase'),
    FindPermissionByIdUsecase: Symbol.for('FindPermissionByIdUsecase'),
    UpdatePermissionUsecase: Symbol.for('UpdatePermissionUsecase'),
    DeletePermissionUsecase: Symbol.for('DeletePermissionUsecase'),
  },
  Role: {
    CreateRoleUsecase: Symbol.for('CreateRoleUsecase'),
    GetRolesUsecase: Symbol.for('GetRolesUsecase'),
    FindRoleByIdUsecase: Symbol.for('FindRoleByIdUsecase'),
    UpdateRoleUsecase: Symbol.for('UpdateRoleUsecase'),
    DeleteRoleUsecase: Symbol.for('DeleteRoleUsecase'),
  },
};
