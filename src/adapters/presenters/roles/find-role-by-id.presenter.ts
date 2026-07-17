import { Role, RoleStruct } from 'src/domain';

export interface FindRoleByIdPresenter {
  present(role: Role): RoleStruct;
}

export class FindRoleByIdPresenterImpl implements FindRoleByIdPresenter {
  present(role: Role): RoleStruct {
    return {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      status: role.status,
    };
  }
}
