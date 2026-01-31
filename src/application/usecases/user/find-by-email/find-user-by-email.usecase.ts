import { Inject } from '@nestjs/common';
import { User, UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { FindUserByEmailUsecase, FindUserByEmailUsecaseParams } from './types';

export class FindUserByEmailUsecaseImpl implements FindUserByEmailUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
  ) {}

  async execute(params: FindUserByEmailUsecaseParams): Promise<User> {
    return await this.userRepository.findByEmail(params.email);
  }
}
