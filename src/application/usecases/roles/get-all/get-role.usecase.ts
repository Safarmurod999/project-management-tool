import { Inject } from '@nestjs/common';
import { RoleRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetRolesUsecase, GetRolesUsecaseParams, GetRolesUsecaseResult } from './types';

export class GetRolesUsecaseImpl implements GetRolesUsecase {
  constructor(
    @Inject(RepositorySymbols.RoleRepository)
    private rolesRepository: RoleRepository,
  ) {}

  async execute(params: GetRolesUsecaseParams): Promise<GetRolesUsecaseResult> {
    return await this.rolesRepository.find(params);
  }
}
