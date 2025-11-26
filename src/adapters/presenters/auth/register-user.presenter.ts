import { User, UserStruct } from 'src/domain';

export type RegisterUserPresentResult = Omit<
  UserStruct,
  'password' | 'createdAt' | 'updatedAt'
>;

export interface RegisterUserPresenter {
  present(user: User): RegisterUserPresentResult;
}

export class RegisterUserPresenterImpl implements RegisterUserPresenter {
  present(user: User): RegisterUserPresentResult {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };
  }
}
