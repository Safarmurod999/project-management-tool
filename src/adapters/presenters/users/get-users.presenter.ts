import { User, UserStruct } from 'src/domain';

export interface GetUsersPresenter {
  present(users: User[]): UserStruct[];
}

export class GetUsersPresenterImpl implements GetUsersPresenter {
  present(users: User[]): UserStruct[] {
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
        status: user.role.status,
        permissions: user.role.permissions.map(p => ({
          id: p.id,
          code: p.code,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          status: p.status,
        })),
        createdAt: user.role.createdAt,
        updatedAt: user.role.updatedAt,
      },
      password: user.password,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.status,
    }));
  }
}
