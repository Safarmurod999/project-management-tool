import { Inject } from '@nestjs/common';
import { UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { GetUsersUsecase, GetUsersUsecaseParams, GetUsersUsecaseResult } from './types';

export class GetUsersUsecaseImpl implements GetUsersUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
  ) {}

  async execute(params: GetUsersUsecaseParams): Promise<GetUsersUsecaseResult> {
    return await this.userRepository.find(params);
  }
}
