import {
  CreatePermissionPresenterImpl,
  FindPermissionByIdPresenterImpl,
  GetPermissionsPresenterImpl
} from 'src/adapters/presenters';
import { Module, forwardRef } from '@nestjs/common';
import {
  PresenterSymbols,
  UsecaseSymbols,
  RepositorySymbols,
  FactorySymbols
} from 'src/infrastructure/dependency-injection';
import { PermissionFactoryImpl } from 'src/domain';
import { PermissionRepositoryImpl } from "src/domain";
import { CreatePermissionUsecaseImpl, DeletePermissionUsecaseImpl, FindPermissionByIdUsecaseImpl, GetPermissionsUsecaseImpl, UpdatePermissionUsecaseImpl } from 'src/application';
import { PermissionController } from 'src/adapters';
import { RolesModule } from '../roles/roles.module';
import { UserModule } from '../users/user.module';

@Module({
  imports: [forwardRef(() => RolesModule), forwardRef(() => UserModule)],
  controllers: [PermissionController],
  providers: [
    {
      provide: FactorySymbols.PermissionFactory,
      useClass: PermissionFactoryImpl,
    },
    {
      provide: RepositorySymbols.PermissionRepository,
      useClass: PermissionRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Permission.CreatePermissionUsecase,
      useClass: CreatePermissionUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Permission.CreatePermissionPresenter,
      useClass: CreatePermissionPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Permission.GetPermissionsUsecase,
      useClass: GetPermissionsUsecaseImpl
    },
    {
      provide: PresenterSymbols.Permission.GetPermissionsPresenter,
      useClass: GetPermissionsPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Permission.FindPermissionByIdUsecase,
      useClass: FindPermissionByIdUsecaseImpl
    },
    {
      provide: PresenterSymbols.Permission.FindPermissionByIdPresenter,
      useClass: FindPermissionByIdPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Permission.UpdatePermissionUsecase,
      useClass: UpdatePermissionUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Permission.UpdatePermissionPresenter,
      useClass: CreatePermissionPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Permission.DeletePermissionUsecase,
      useClass: DeletePermissionUsecaseImpl,
    }
  ],
  exports: [
    UsecaseSymbols.Permission.CreatePermissionUsecase,
    PresenterSymbols.Permission.CreatePermissionPresenter,
    UsecaseSymbols.Permission.GetPermissionsUsecase,
    PresenterSymbols.Permission.GetPermissionsPresenter,
    UsecaseSymbols.Permission.FindPermissionByIdUsecase,
    PresenterSymbols.Permission.FindPermissionByIdPresenter,
  ]
})
export class PermissionModule {}
