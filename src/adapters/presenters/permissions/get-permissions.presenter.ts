import { Permission, PermissionStruct } from 'src/domain';

export interface GetPermissionsPresenter {
  present(permissions: Permission[]): PermissionStruct[];
}

export class GetPermissionsPresenterImpl implements GetPermissionsPresenter {
  present(permissions: Permission[]): PermissionStruct[] {
    return permissions.map((permission) => ({
      id: permission.id,
      code: permission.code,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      status: permission.status,
    }));
  }
}
