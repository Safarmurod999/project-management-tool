import { Inject } from '@nestjs/common';
import { Role, RoleRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateRoleUsecase, CreateRoleUsecaseParams } from './types';

export class CreateRoleUsecaseImpl implements CreateRoleUsecase {
  constructor(
    @Inject(RepositorySymbols.RoleRepository)
    private roleRepository: RoleRepository,
  ) {}

  async execute(params: CreateRoleUsecaseParams): Promise<Role> {
    const newRole = {
      name: params.name,
      permissions: params.permissions,
      description: params.description,
      isActive: params.isActive,
    };

    return await this.roleRepository.create(newRole);
  }
}
