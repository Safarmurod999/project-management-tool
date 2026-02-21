import { Inject } from '@nestjs/common';
import { UserRepository, UserException } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { TokenService } from 'src/infrastructure/helpers';
import { ConfigSymbols, ServiceSymbols } from 'src/infrastructure';
import { AuthConfig } from 'src/config';
import { RefreshTokenUsecase, RefreshTokenUsecaseResult } from './types';

export class RefreshTokenUsecaseImpl implements RefreshTokenUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,

    @Inject(ServiceSymbols.TokenService)
    private tokenService: TokenService,

    @Inject(ConfigSymbols.AuthConfig)
    private authConfig: AuthConfig,
  ) {}

  async execute(refreshToken: string): Promise<RefreshTokenUsecaseResult> {
    if (!refreshToken) {
      throw UserException.UnauthorizedAccess('refresh token');
    }

    const payload = this.tokenService.parseToken(
      refreshToken
    );

    if (!payload?.userId) {
      throw UserException.UnauthorizedAccess('refresh token');
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw UserException.UserNotFound(payload.userId);
    }

    const newAccessToken = this.tokenService.generateToken(
      {
        userId: user.id,
        email: user.email,
        roleId: user.role.id,
      },
      this.authConfig.getAccessSecret(),
      this.authConfig.getAccessSecretExpiresIn(),
    );

    return { access_token: newAccessToken };
  }
}
