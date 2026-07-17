import { User, UserStruct } from 'src/domain';

export interface CreateUserPresenter {
  present(user: User): UserStruct;
}

export class CreateUserPresenterImpl implements CreateUserPresenter {
  present(user: User): UserStruct {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
        code: user.role.code,
        description: user.role.description,
        status: user.role.status,
        createdAt: user.role.createdAt,
        updatedAt: user.role.updatedAt,
      },
      password: user.password,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.status,
    };
  }
}
