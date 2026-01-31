import { Inject } from '@nestjs/common';
import { Role, RoleRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindRoleByIdUsecase, FindRoleByIdUsecaseParams } from './types';

export class FindRoleByIdUsecaseImpl implements FindRoleByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.RoleRepository)
    private roleRepository: RoleRepository,
  ) {}

  async execute (params: FindRoleByIdUsecaseParams): Promise<Role> {
    return await this.roleRepository.findById(params.id);
  }
}
