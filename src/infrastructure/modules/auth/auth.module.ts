import { RegisterUserPresenterImpl } from 'src/adapters/presenters';
import { Module } from '@nestjs/common';
import { AuthController } from 'src/adapters';
import {
  PresenterSymbols,
  ServiceSymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { TokenServiceImpl } from 'src/infrastructure/helpers';
import { OtpModule } from 'src/infrastructure/modules/otp/otp.module';
import { UserModule } from 'src/infrastructure/modules/users/user.module';
import {
  RegisterUserUsecaseImpl,
  VerifyUserUsecaseImpl,
} from 'src/application';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  imports: [
    OtpModule,
    UserModule,
    JwtModule.register({
      secret: 'your-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    {
      provide: ServiceSymbols.TokenService,
      useClass: TokenServiceImpl,
    },
    {
      provide: UsecaseSymbols.RegisterUserUsecase,
      useClass: RegisterUserUsecaseImpl,
    },
    {
      provide: UsecaseSymbols.VerifyUserUsecase,
      useClass: VerifyUserUsecaseImpl,
    },
    {
      provide: PresenterSymbols.RegisterUserPresenter,
      useClass: RegisterUserPresenterImpl,
    },
  ],
})
export class AuthModule {}
