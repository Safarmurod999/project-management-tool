import { Inject } from '@nestjs/common';
import { Permission, PermissionRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindPermissionByIdUsecase, FindPermissionByIdUsecaseParams } from './types';

export class FindPermissionByIdUsecaseImpl implements FindPermissionByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async execute(params: FindPermissionByIdUsecaseParams): Promise<Permission> {
    return await this.permissionRepository.findById(params.id);
  }
}
