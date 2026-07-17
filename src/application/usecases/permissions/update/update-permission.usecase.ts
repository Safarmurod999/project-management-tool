import { Inject } from '@nestjs/common';
import { Permission, PermissionRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  UpdatePermissionUsecase,
  UpdatePermissionUsecaseParams,
} from './types';

export class UpdatePermissionUsecaseImpl implements UpdatePermissionUsecase {
  constructor(
    @Inject(RepositorySymbols.PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async execute(params: UpdatePermissionUsecaseParams): Promise<Permission> {
    const permission = {
      id: params.id,
      code: params.code,
      status: params.status,
    };

    return await this.permissionRepository.update(permission);
  }
}
