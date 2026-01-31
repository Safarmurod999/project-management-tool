import { Permission, PermissionStruct } from 'src/domain';

export interface FindPermissionByIdPresenter {
  present(permission: Permission): PermissionStruct;
}

export class FindPermissionByIdPresenterImpl implements FindPermissionByIdPresenter {
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
