import { Inject } from '@nestjs/common';
import { Permission, PermissionRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreatePermissionUsecase, CreatePermissionUsecaseParams } from './types';

export class CreatePermissionUsecaseImpl implements CreatePermissionUsecase {
  constructor(
    @Inject(RepositorySymbols.PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async execute(params: CreatePermissionUsecaseParams): Promise<Permission> {
    const newPermission = {
      name: params.name,
      description: params.description,
      isActive: params.isActive,
    };

    return await this.permissionRepository.create(newPermission);
  }
}
