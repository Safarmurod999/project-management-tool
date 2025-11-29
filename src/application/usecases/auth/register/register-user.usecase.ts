import { Inject } from '@nestjs/common';
import { UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  RegisterUserUsecase,
  RegisterUserUsecaseParams,
  RegisterUserUsecaseResult,
} from './types';

export class RegisterUserUsecaseImpl implements RegisterUserUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
  ) {}

  async execute(
    params: RegisterUserUsecaseParams,
  ): Promise<RegisterUserUsecaseResult> {
    
    const newUser = {
      name: params.name,
      email: params.email,
      password: params.password,
    };

    return await this.userRepository.create(newUser);
  }
}
