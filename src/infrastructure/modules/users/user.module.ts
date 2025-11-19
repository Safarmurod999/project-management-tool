import { Module } from '@nestjs/common';
import { UserController } from 'src/adapters';
import { CreateUserUsecaseImpl } from 'src/application/usecases/user/create-user/create-user.usecase';
import { UserFactoryImpl } from 'src/domain';
import { UserRepositoryImpl } from 'src/domain/users/repository';
import {
  FactorySymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { MongoDbModule } from '../mongodb/mongodb.module';

@Module({
  imports: [MongoDbModule],
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
  ],
})
export class UserModule {}
