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
      isVerified: user.isVerified,
      status: user.status,
    };
  }
}
