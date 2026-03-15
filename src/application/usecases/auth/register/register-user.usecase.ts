import { Inject } from '@nestjs/common';
import { RoleRepository, UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { PasswordService } from 'src/infrastructure/helpers';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import {
  RegisterUserUsecase,
  RegisterUserUsecaseParams,
  RegisterUserUsecaseResult,
} from './types';

export class RegisterUserUsecaseImpl implements RegisterUserUsecase {
  constructor(
    @Inject(RepositorySymbols.RoleRepository)
    private roleRepository: RoleRepository,
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
    @Inject(ServiceSymbols.PasswordService)
    private passwordService: PasswordService,
  ) {}

  async execute(
    params: RegisterUserUsecaseParams,
  ): Promise<RegisterUserUsecaseResult> {

    const firstRole = await this.roleRepository.findFirst();

    const hashedPassword = await this.passwordService.hashPassword(params.password);
    
    const newUser = {
      name: params.name,
      email: params.email,
      password: hashedPassword,
      role: firstRole.id,
    };

    return await this.userRepository.create(newUser);
  }
}
