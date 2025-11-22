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
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
