import { RegisterUserPresenterImpl } from 'src/adapters/presenters';
import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from 'src/adapters';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { OtpModule } from 'src/infrastructure/modules/otp/otp.module';
import { UserModule } from 'src/infrastructure/modules/users/user.module';
import { CommonModule } from '../common/common.module';
import {
  LoginUserUsecaseImpl,
  RefreshTokenUsecaseImpl,
  RegisterUserUsecaseImpl,
  VerifyUserUsecaseImpl,
  GetMeUsecaseImpl,
} from 'src/application';
import { RoleRepositoryImpl } from 'src/domain/roles/repository';
import { RoleFactoryImpl, RolePermissionRepositoryImpl } from 'src/domain';
@Module({
  controllers: [AuthController],
  imports: [OtpModule, forwardRef(() => UserModule), CommonModule],
  providers: [
    {
      provide: RepositorySymbols.RoleRepository,
      useClass: RoleRepositoryImpl,
    },
    {
      provide: RepositorySymbols.RolePermissionRepository,
      useClass: RolePermissionRepositoryImpl,
    },
    {
      provide: FactorySymbols.RoleFactory,
      useClass: RoleFactoryImpl,
    },
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
    },
    {
      provide: UsecaseSymbols.Auth.GetMeUsecase,
      useClass: GetMeUsecaseImpl,
    },
  ],
})
export class AuthModule {}
