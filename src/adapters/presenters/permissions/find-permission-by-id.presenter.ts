import { Permission, PermissionStruct } from 'src/domain';

export interface FindPermissionByIdPresenter {
  present(permission: Permission): PermissionStruct;
}

export class FindPermissionByIdPresenterImpl implements FindPermissionByIdPresenter {
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
