import { Module } from '@nestjs/common';
import {
  CreateUserPresenterImpl,
  FindUserByEmailPresenterImpl,
  FindUserByIdPresenterImpl,
  UpdateUserPresenterImpl,
  UserController,
} from 'src/adapters';
import { PermissionFactoryImpl, RoleFactoryImpl, UserFactoryImpl } from 'src/domain';
import { UserRepositoryImpl } from 'src/domain';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import {
  CreateUserUsecaseImpl,
  DeleteUserUsecaseImpl,
  FindUserByEmailUsecaseImpl,
  FindUserByIdUsecaseImpl,
  UpdateUserUsecaseImpl,
} from 'src/application';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: FactorySymbols.UserFactory,
      useClass: UserFactoryImpl,
    },
    {
      provide: RepositorySymbols.UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.User.CreateUserUsecase,
      useClass: CreateUserUsecaseImpl,
    },
    {
      provide: PresenterSymbols.User.CreateUserPresenter,
      useClass: CreateUserPresenterImpl,
    },
    {
      provide: UsecaseSymbols.User.FindUserByIdUsecase,
      useClass: FindUserByIdUsecaseImpl,
    },
    {
      provide: PresenterSymbols.User.FindUserByIdPresenter,
      useClass: FindUserByIdPresenterImpl,
    },
    {
      provide: UsecaseSymbols.User.FindUserByEmailUsecase,
      useClass: FindUserByEmailUsecaseImpl,
    },
    {
      provide: PresenterSymbols.User.FindUserByEmailPresenter,
      useClass: FindUserByEmailPresenterImpl,
    },
    {
      provide: UsecaseSymbols.User.UpdateUserUsecase,
      useClass: UpdateUserUsecaseImpl,
    },
    {
      provide: PresenterSymbols.User.UpdateUserPresenter,
      useClass: UpdateUserPresenterImpl,
    },
    {
      provide: UsecaseSymbols.User.DeleteUserUsecase,
      useClass: DeleteUserUsecaseImpl,
    },
    {
      provide: FactorySymbols.RoleFactory,
      useClass: RoleFactoryImpl,
    },
    {
      provide: FactorySymbols.PermissionFactory,
      useClass: PermissionFactoryImpl,
    }
  ],
  exports: [
    FactorySymbols.UserFactory,
    RepositorySymbols.UserRepository,
    UsecaseSymbols.User.CreateUserUsecase,
    UsecaseSymbols.User.FindUserByIdUsecase,
    UsecaseSymbols.User.FindUserByEmailUsecase,
    UsecaseSymbols.User.UpdateUserUsecase,
    UsecaseSymbols.User.DeleteUserUsecase,
  ],
})
export class UserModule {}
