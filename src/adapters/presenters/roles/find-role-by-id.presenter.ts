import { Role, RoleStruct } from 'src/domain';

export interface FindRoleByIdPresenter {
  present(role: Role): RoleStruct;
}

export class FindRoleByIdPresenterImpl implements FindRoleByIdPresenter {
  present(role: Role): RoleStruct {
    return {
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
    };
  }
}
