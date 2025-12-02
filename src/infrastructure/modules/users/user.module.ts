import { Module } from '@nestjs/common';
import {
  CreateUserPresenterImpl,
  FindUserByEmailPresenterImpl,
  FindUserByIdPresenterImpl,
  UpdateUserPresenterImpl,
  UserController,
} from 'src/adapters';
import { UserFactoryImpl } from 'src/domain';
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
      provide: UsecaseSymbols.CreateUserUsecase,
      useClass: CreateUserUsecaseImpl,
    },
    {
      provide: PresenterSymbols.CreateUserPresenter,
      useClass: CreateUserPresenterImpl,
    },
    {
      provide: UsecaseSymbols.FindUserByIdUsecase,
      useClass: FindUserByIdUsecaseImpl,
    },
    {
      provide: PresenterSymbols.FindUserByIdPresenter,
      useClass: FindUserByIdPresenterImpl,
    },
    {
      provide: UsecaseSymbols.FindUserByEmailUsecase,
      useClass: FindUserByEmailUsecaseImpl,
    },
    {
      provide: PresenterSymbols.FindUserByEmailPresenter,
      useClass: FindUserByEmailPresenterImpl,
    },
    {
      provide: UsecaseSymbols.UpdateUserUsecase,
      useClass: UpdateUserUsecaseImpl,
    },
    {
      provide: PresenterSymbols.UpdateUserPresenter,
      useClass: UpdateUserPresenterImpl,
    },
    {
      provide: UsecaseSymbols.DeleteUserUsecase,
      useClass: DeleteUserUsecaseImpl,
    },
  ],
  exports: [
    FactorySymbols.UserFactory,
    RepositorySymbols.UserRepository,
    UsecaseSymbols.CreateUserUsecase,
    UsecaseSymbols.FindUserByIdUsecase,
    UsecaseSymbols.FindUserByEmailUsecase,
    UsecaseSymbols.UpdateUserUsecase,
    UsecaseSymbols.DeleteUserUsecase,
  ],
})
export class UserModule {}
