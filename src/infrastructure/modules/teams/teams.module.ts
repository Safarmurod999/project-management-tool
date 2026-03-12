import { Module } from '@nestjs/common';
import { TeamController } from 'src/adapters';
import { RolePermissionRepositoryImpl, TeamFactoryImpl, TeamRepositoryImpl, UserRepositoryImpl } from 'src/domain';
import {
  CreateTeamUsecaseImpl,
  DeleteTeamUsecaseImpl,
  FindTeamByIdUsecaseImpl,
  GetTeamsUsecaseImpl,
  UpdateTeamUsecaseImpl,
} from 'src/application';
import {
  CreateTeamPresenterImpl,
  FindTeamByIdPresenterImpl,
  GetTeamsPresenterImpl,
} from 'src/adapters';
import {
  FactorySymbols,
  PresenterSymbols,
  RepositorySymbols,
  UsecaseSymbols,
} from 'src/infrastructure/dependency-injection';
import { UserModule } from '../users/user.module';
import { RolesModule } from '../roles/roles.module';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [UserModule, RolesModule, MembershipsModule],
  controllers: [TeamController],
  providers: [
    {
      provide: FactorySymbols.TeamFactory,
      useClass: TeamFactoryImpl,
    },
    {
      provide: RepositorySymbols.TeamRepository,
      useClass: TeamRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Team.CreateTeamUsecase,
      useClass: CreateTeamUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Team.CreateTeamPresenter,
      useClass: CreateTeamPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Team.FindTeamByIdUsecase,
      useClass: FindTeamByIdUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Team.FindTeamByIdPresenter,
      useClass: FindTeamByIdPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Team.GetTeamsUsecase,
      useClass: GetTeamsUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Team.GetTeamsPresenter,
      useClass: GetTeamsPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Team.UpdateTeamUsecase,
      useClass: UpdateTeamUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Team.UpdateTeamPresenter,
      useClass: CreateTeamPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Team.DeleteTeamUsecase,
      useClass: DeleteTeamUsecaseImpl,
    },
    {
      provide: RepositorySymbols.UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: RepositorySymbols.RolePermissionRepository,
      useClass: RolePermissionRepositoryImpl,
    }
  ],
  exports: [
    FactorySymbols.TeamFactory,
    RepositorySymbols.TeamRepository,
    UsecaseSymbols.Team.CreateTeamUsecase,
    UsecaseSymbols.Team.FindTeamByIdUsecase,
    UsecaseSymbols.Team.GetTeamsUsecase,
    UsecaseSymbols.Team.UpdateTeamUsecase,
    UsecaseSymbols.Team.DeleteTeamUsecase,
  ],
})
export class TeamsModule {}
