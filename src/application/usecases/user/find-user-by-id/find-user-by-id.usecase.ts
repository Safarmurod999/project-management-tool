import { Inject } from '@nestjs/common';
import { User, UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindUserByIdUsecase, FindUserByIdUsecaseParams } from './types';

export class FindUserByIdUsecaseImpl implements FindUserByIdUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
  ) {}

  async execute(params: FindUserByIdUsecaseParams): Promise<User> {
    return await this.userRepository.findById(params.id);
  }
}
