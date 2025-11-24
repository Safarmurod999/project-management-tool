import { Inject } from '@nestjs/common';
import { User, UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateUserUsecase, CreateUserUsecaseParams } from './types';

export class CreateUserUsecaseImpl implements CreateUserUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
  ) {}

  async execute(params: CreateUserUsecaseParams): Promise<User> {
    const newUser = {
      name: params.name,
      email: params.email,
      password: params.password,
    };

    return this.userRepository.create(newUser);
  }
}
