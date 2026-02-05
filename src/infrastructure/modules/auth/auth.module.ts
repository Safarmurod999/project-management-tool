import { RegisterUserPresenterImpl } from 'src/adapters/presenters';
import { Module } from '@nestjs/common';
import { AuthController } from 'src/adapters';
import {
  PresenterSymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { OtpModule } from 'src/infrastructure/modules/otp/otp.module';
import { UserModule } from 'src/infrastructure/modules/users/user.module';
import {
  LoginUserUsecaseImpl,
  RefreshTokenUsecaseImpl,
  RegisterUserUsecaseImpl,
  VerifyUserUsecaseImpl,
} from 'src/application';
@Module({
  controllers: [AuthController],
  imports: [OtpModule, UserModule],
  providers: [
    {
      provide: UsecaseSymbols.Auth.RegisterUserUsecase,
      useClass: RegisterUserUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Auth.VerifyUserUsecase,
      useClass: VerifyUserUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Auth.RegisterUserPresenter,
      useClass: RegisterUserPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Auth.LoginUserUsecase,
      useClass: LoginUserUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.Auth.RefreshTokenUsecase,
      useClass: RefreshTokenUsecaseImpl,
    }
  ],
})
export class AuthModule {}
