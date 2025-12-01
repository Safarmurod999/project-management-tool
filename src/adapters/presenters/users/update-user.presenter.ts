import { User, UserStruct } from 'src/domain';

export interface UpdateUserPresenter {
  present(user: User): UserStruct;
}

export class UpdateUserPresenterImpl implements UpdateUserPresenter {
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
