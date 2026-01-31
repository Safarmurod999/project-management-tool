import { Permission, PermissionStruct } from 'src/domain';

export interface CreatePermissionPresenter {
  present(permission: Permission): PermissionStruct;
}

export class CreatePermissionPresenterImpl implements CreatePermissionPresenter {
  present(permission: Permission): PermissionStruct {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      isActive: permission.isActive,
    };
  }
}
