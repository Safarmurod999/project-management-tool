import { Inject } from '@nestjs/common';
import { PermissionRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetPermissionsUsecase, GetPermissionsUsecaseParams, GetPermissionsUsecaseResult } from './types';

export class GetPermissionsUsecaseImpl implements GetPermissionsUsecase {
  constructor(
    @Inject(RepositorySymbols.PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async execute(params: GetPermissionsUsecaseParams): Promise<GetPermissionsUsecaseResult> {
    return await this.permissionRepository.getAll(params);
  }
}
