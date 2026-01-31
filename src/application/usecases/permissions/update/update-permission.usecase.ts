import { Inject } from '@nestjs/common';
import { Permission, PermissionRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UpdatePermissionUsecase, UpdatePermissionUsecaseParams } from './types';

export class UpdatePermissionUsecaseImpl implements UpdatePermissionUsecase {
  constructor(
    @Inject(RepositorySymbols.PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async execute(params: UpdatePermissionUsecaseParams): Promise<Permission> {
    const permission = {
      id: params.id,
      name: params.name,
      description: params.description,
      isActive: params.isActive,
    };

    return await this.permissionRepository.update(permission);
  }
}
