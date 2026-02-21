import { Inject } from '@nestjs/common';
import { UserException, UserRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  LoginUserUsecase,
  LoginUserUsecaseParams,
  LoginUserUsecaseResult,
} from './types';
import { TokenService } from 'src/infrastructure/helpers';
import { ConfigSymbols, ServiceSymbols } from 'src/infrastructure';
import { AuthConfig } from 'src/config';

export class LoginUserUsecaseImpl implements LoginUserUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,

    @Inject(ServiceSymbols.TokenService)
    private tokenService: TokenService,

    @Inject(ConfigSymbols.AuthConfig)
    private authConfig: AuthConfig,
  ) {}

  async execute(
    params: LoginUserUsecaseParams,
  ): Promise<LoginUserUsecaseResult> {
    const user = await this.userRepository.findByEmail(params.email);
    
    if (!user?.isVerified) {
        throw UserException.UnverifiedUser();
    }    

    if (user?.password !== params.password) {
      throw UserException.IncorrectPassword();
    }

    const tokens = {
      access_token: this.tokenService.generateToken(
        {
          userId: user.id,
          email: user.email,
          roleId: user.role.id,
        },
        this.authConfig.getAccessSecret(),
        this.authConfig.getAccessSecretExpiresIn(),
      ),
      refresh_token: this.tokenService.generateToken(
        { userId: user.id },
        this.authConfig.getRefreshSecret(),
        this.authConfig.getRefreshSecretExpiresIn(),
      ),
    };

    return tokens;
  }
}
