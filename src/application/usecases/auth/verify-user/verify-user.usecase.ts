import { Inject } from '@nestjs/common';
import {
  ConfigSymbols,
  RepositorySymbols,
  ServiceSymbols,
} from 'src/infrastructure';
import { OtpRepository, UserRepository } from 'src/domain';
import {
  VerifyUserUsecase,
  VerifyUserUsecaseParams,
  VerifyUserUsecaseResult,
} from './types';
import { TokenService } from 'src/infrastructure/helpers/token-service';
import { AuthConfig } from 'src/config';

export class VerifyUserUsecaseImpl implements VerifyUserUsecase {
  constructor(
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,

    @Inject(RepositorySymbols.OtpRepository)
    private otpRepository: OtpRepository,

    @Inject(ServiceSymbols.TokenService)
    private tokenService: TokenService,

    @Inject(ConfigSymbols.AuthConfig)
    private authConfig: AuthConfig,
  ) {}

  async execute(
    params: VerifyUserUsecaseParams,
  ): Promise<VerifyUserUsecaseResult> {
    let otp = await this.otpRepository.get(params.token);

    if (!otp) {
      throw new Error('Invalid or expired token');
    }

    await this.userRepository.update({
      id: params.id,
      isVerified: true,
    });

    const tokens = {
      access_token: this.tokenService.generateToken(
        { userId: params.id },
        this.authConfig.getAccessSecret(),
        this.authConfig.getAccessSecretExpiresIn(),
      ),

      refresh_token: this.tokenService.generateToken(
        { userId: params.id },
        this.authConfig.getRefreshSecret(),
        this.authConfig.getRefreshSecretExpiresIn(),
      ),
    };

    return tokens;
  }
}
