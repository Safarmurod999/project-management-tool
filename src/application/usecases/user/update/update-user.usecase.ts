import { Inject } from '@nestjs/common';
import { User, UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { PasswordService } from 'src/infrastructure/helpers';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { UpdateUserUsecase, UpdateUserUsecaseParams } from './types';

export class UpdateUserUsecaseImpl implements UpdateUserUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
    @Inject(ServiceSymbols.PasswordService)
    private passwordService: PasswordService,
  ) {}

  async execute(params: UpdateUserUsecaseParams): Promise<User> {
    let password = params.password;
    
    if (params.password) {
      password = await this.passwordService.hashPassword(params.password);
    }

    const newUser = {
      id: params.id,
      name: params.name,
      email: params.email,
      password: password,
      role: params.role,
      isVerified: params.isVerified,
      status: params.status,
    };

    return this.userRepository.update(newUser);
  }
}
