import { Inject } from '@nestjs/common';
import { User, UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateUserUsecase, CreateUserUsecaseParams } from './types';
import {Logger} from "src/infrastructure";

export class CreateUserUsecaseImpl implements CreateUserUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
    private readonly logger: Logger
  ) {}

  async execute(params: CreateUserUsecaseParams): Promise<User> {
    const newUser = {
      name: params.name,
      email: params.email,
      password: params.password,
    };

    this.logger.log('Creating user', { newUser });

    return this.userRepository.create(newUser);
  }
}
