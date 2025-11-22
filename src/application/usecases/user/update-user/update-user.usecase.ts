import { Inject } from '@nestjs/common';
import { User, UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { UpdateUserUsecase, UpdateUserUsecaseParams } from './types';

export class UpdateUserUsecaseImpl implements UpdateUserUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
  ) {}

  async execute(params: UpdateUserUsecaseParams): Promise<User> {
    const newUser = {
      id: params.id,
      name: params.name,
      email: params.email,
      password: params.password,
    };

    return this.userRepository.update(newUser);
  }
}
