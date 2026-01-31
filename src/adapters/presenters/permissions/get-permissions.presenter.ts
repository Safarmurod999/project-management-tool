import { Permission, PermissionStruct } from 'src/domain';

export interface GetPermissionsPresenter {
  present(permissions: Permission[]): PermissionStruct[];
}

export class GetPermissionsPresenterImpl implements GetPermissionsPresenter {
  present(permissions: Permission[]): PermissionStruct[] {
    return permissions.map((permission) => (
      {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        createdAt: permission.createdAt,
        updatedAt: permission.updatedAt,
        isActive: permission.isActive,
      }
    ));
  }
}
