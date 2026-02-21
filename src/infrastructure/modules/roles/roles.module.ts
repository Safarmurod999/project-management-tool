import {
  CreateRolePresenterImpl,
  FindRoleByIdPresenterImpl,
  GetRolesPresenterImpl
} from 'src/adapters/presenters';
import { Module, forwardRef } from '@nestjs/common';
import {
  PresenterSymbols,
  UsecaseSymbols,
  RepositorySymbols,
  FactorySymbols
} from 'src/infrastructure/dependency-injection';
import { RoleFactoryImpl, RolePermissionRepositoryImpl } from 'src/domain';
import { RoleRepositoryImpl } from "src/domain";
import { CreateRoleUsecaseImpl, DeleteRoleUsecaseImpl, FindRoleByIdUsecaseImpl, GetRolesUsecaseImpl, UpdateRoleUsecaseImpl } from 'src/application';
import { RoleController } from 'src/adapters';
import { UserModule } from '../users/user.module';

@Module({  
  imports: [forwardRef(() => UserModule)],
  controllers: [RoleController],
  providers: [
    {
      provide: FactorySymbols.RoleFactory,
      useClass: RoleFactoryImpl,
    },
    {
      provide: RepositorySymbols.RoleRepository,
      useClass: RoleRepositoryImpl,
    },
    {
      provide: RepositorySymbols.RolePermissionRepository,
      useClass: RolePermissionRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Role.CreateRoleUsecase,
      useClass: CreateRoleUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Role.CreateRolePresenter,
      useClass: CreateRolePresenterImpl,
    },
    {
      provide: UsecaseSymbols.Role.GetRolesUsecase,
      useClass: GetRolesUsecaseImpl
    },
    {
      provide: PresenterSymbols.Role.GetRolesPresenter,
      useClass: GetRolesPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Role.FindRoleByIdUsecase,
      useClass: FindRoleByIdUsecaseImpl
    },
    {
      provide: PresenterSymbols.Role.FindRoleByIdPresenter,
      useClass: FindRoleByIdPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Role.UpdateRoleUsecase,
      useClass: UpdateRoleUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Role.UpdateRolePresenter,
      useClass: CreateRolePresenterImpl,
    },
    {
      provide: UsecaseSymbols.Role.DeleteRoleUsecase,
      useClass: DeleteRoleUsecaseImpl,
    }
  ],
  exports: [
    RepositorySymbols.RoleRepository,
    RepositorySymbols.RolePermissionRepository,
    UsecaseSymbols.Role.CreateRoleUsecase,
    PresenterSymbols.Role.CreateRolePresenter,
    UsecaseSymbols.Role.GetRolesUsecase,
    PresenterSymbols.Role.GetRolesPresenter,
    UsecaseSymbols.Role.FindRoleByIdUsecase,
    PresenterSymbols.Role.FindRoleByIdPresenter,
  ]
})
export class RolesModule {}
