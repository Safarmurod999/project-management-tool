import { Permission, PermissionStruct } from 'src/domain';

export interface CreatePermissionPresenter {
  present(permission: Permission): PermissionStruct;
}

export class CreatePermissionPresenterImpl implements CreatePermissionPresenter {
  present(permission: Permission): PermissionStruct {
    return {
      id: permission.id,
      code: permission.code,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      status: permission.status,
    };
  }
}
