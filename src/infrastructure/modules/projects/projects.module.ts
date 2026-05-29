import { Module } from '@nestjs/common';
import { ProjectController } from 'src/adapters';
import {
  ProjectFactoryImpl,
  ProjectRepositoryImpl,
  RolePermissionRepositoryImpl,
  UserRepositoryImpl,
} from 'src/domain';
import {
  CreateProjectUsecaseImpl,
  DeleteProjectUsecaseImpl,
  FindProjectByIdUsecaseImpl,
  GetProjectsUsecaseImpl,
  UpdateProjectUsecaseImpl,
  GetProjectMembersUsecaseImpl,
} from 'src/application';
import {
  CreateProjectPresenterImpl,
  FindProjectByIdPresenterImpl,
  GetProjectsPresenterImpl,
  GetProjectMembersPresenterImpl
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
  controllers: [ProjectController],
  providers: [
    {
      provide: FactorySymbols.ProjectFactory,
      useClass: ProjectFactoryImpl,
    },
    {
      provide: RepositorySymbols.ProjectRepository,
      useClass: ProjectRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Project.CreateProjectUsecase,
      useClass: CreateProjectUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Project.CreateProjectPresenter,
      useClass: CreateProjectPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Project.FindProjectByIdUsecase,
      useClass: FindProjectByIdUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Project.FindProjectByIdPresenter,
      useClass: FindProjectByIdPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Project.GetProjectsUsecase,
      useClass: GetProjectsUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Project.GetProjectsPresenter,
      useClass: GetProjectsPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Project.UpdateProjectUsecase,
      useClass: UpdateProjectUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Project.UpdateProjectPresenter,
      useClass: CreateProjectPresenterImpl,
    },
    {
      provide: UsecaseSymbols.Project.DeleteProjectUsecase,
      useClass: DeleteProjectUsecaseImpl,
    },
    {
      provide: RepositorySymbols.UserRepository,
      useClass: UserRepositoryImpl,
    },
    {
      provide: RepositorySymbols.RolePermissionRepository,
      useClass: RolePermissionRepositoryImpl,
    },
    {
      provide: UsecaseSymbols.Membership.GetProjectMembersUsecase,
      useClass: GetProjectMembersUsecaseImpl,
    },
    {
      provide: PresenterSymbols.Membership.GetProjectMembersPresenter,
      useClass: GetProjectMembersPresenterImpl,
    },
  ],
  exports: [
    FactorySymbols.ProjectFactory,
    RepositorySymbols.ProjectRepository,
    UsecaseSymbols.Project.CreateProjectUsecase,
    UsecaseSymbols.Project.FindProjectByIdUsecase,
    UsecaseSymbols.Project.GetProjectsUsecase,
    UsecaseSymbols.Project.UpdateProjectUsecase,
    UsecaseSymbols.Project.DeleteProjectUsecase,
  ],
})
export class ProjectsModule {}
