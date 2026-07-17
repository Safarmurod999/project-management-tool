import { Inject } from '@nestjs/common';
import { Role, RoleRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UpdateRoleUsecase, UpdateRoleUsecaseParams } from './types';

export class UpdateRoleUsecaseImpl implements UpdateRoleUsecase {
  constructor(
    @Inject(RepositorySymbols.RoleRepository)
    private roleRepository: RoleRepository,
  ) {}

  async execute(params: UpdateRoleUsecaseParams): Promise<Role> {
    const role = {
      id: params.id,
      name: params.name,
      code: params.code,
      permissions: params.permissions,
      description: params.description,
      status: params.status,
    };

    return await this.roleRepository.update(role);
  }
}
