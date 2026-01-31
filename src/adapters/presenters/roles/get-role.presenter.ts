import { Role, RoleStruct } from 'src/domain';

export interface GetRolesPresenter {
  present(roles: Role[]): RoleStruct[];
}

export class GetRolesPresenterImpl implements GetRolesPresenter {
  present(roles: Role[]): RoleStruct[] {
    return roles.map((role) => (
      {
        id: role.id,
        name: role.name,
        permissions: role.permissions.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          isActive: p.isActive,
        })),
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        isActive: role.isActive,
      }
    ));
  }
}
