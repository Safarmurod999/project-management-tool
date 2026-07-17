import { Inject } from '@nestjs/common';
import { RoleRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { DeleteRoleUsecase, DeleteRoleUsecaseParams } from './types';

export class DeleteRoleUsecaseImpl implements DeleteRoleUsecase {
  constructor(
    @Inject(RepositorySymbols.RoleRepository)
    private roleRepository: RoleRepository,
  ) {}

  async execute(params: DeleteRoleUsecaseParams): Promise<string> {
    return await this.roleRepository.delete(params.id);
  }
}
