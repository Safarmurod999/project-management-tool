import { Inject } from '@nestjs/common';
import { UserRepository, UserException, RolePermissionRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetMeUsecase, GetMeUsecaseParams, GetMeUsecaseResult } from './types';

export class GetMeUsecaseImpl implements GetMeUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
    @Inject(RepositorySymbols.RolePermissionRepository)
    private rolePermissionRepository: RolePermissionRepository,
  ) {}

  async execute(params: GetMeUsecaseParams): Promise<GetMeUsecaseResult> {
    const user = await this.userRepository.findById(params.userId);

    if (!user) {
      throw UserException.UserNotFound(params.userId);
    }

    // Fetch permissions for the user's role
    const permissions = await this.rolePermissionRepository.getPermissionsByRoleId(
      user.role.id,
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
        code: user.role.code,
      },
      permissions: permissions.map((p) => ({
        id: p.id,
        name: p.code,
        code: p.code,
      })),
    };
  }
}
