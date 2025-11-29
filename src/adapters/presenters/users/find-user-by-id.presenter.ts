import { User, UserStruct } from 'src/domain';

export interface FindUserByIdPresenter {
  present(user: User): UserStruct;
}

export class FindUserByIdPresenterImpl implements FindUserByIdPresenter {
  present(user: User): UserStruct {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
