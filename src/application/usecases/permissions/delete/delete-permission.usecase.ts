import { Inject } from '@nestjs/common';
import { PermissionRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { DeletePermissionUsecase, DeletePermissionUsecaseParams } from './types';

export class DeletePermissionUsecaseImpl implements DeletePermissionUsecase {
  constructor(
    @Inject(RepositorySymbols.PermissionRepository)
    private permissionRepository: PermissionRepository,
  ) {}

  async execute(params: DeletePermissionUsecaseParams): Promise<string> {
    return await this.permissionRepository.delete(params.id);
  }
}
