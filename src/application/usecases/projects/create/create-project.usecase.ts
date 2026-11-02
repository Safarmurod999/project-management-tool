import { Inject } from '@nestjs/common';
import {
  buildDefaultStatuses,
  MembershipRepository,
  Project,
  ProjectRepository,
  StatusRepository,
} from 'src/domain';
import { TransactionManager } from 'src/application/services';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { ServiceSymbols } from 'src/infrastructure/dependency-injection/services/symbol';
import { CreateProjectUsecase, CreateProjectUsecaseParams } from './types';
import { ScopeType } from 'src/infrastructure/common/enum';

export class CreateProjectUsecaseImpl implements CreateProjectUsecase {
  constructor(
    @Inject(RepositorySymbols.ProjectRepository)
    private projectRepository: ProjectRepository,

    @Inject(RepositorySymbols.MembershipRepository)
    private readonly membershipRepository: MembershipRepository,

    @Inject(RepositorySymbols.StatusRepository)
    private readonly statusRepository: StatusRepository,

    @Inject(ServiceSymbols.TransactionManager)
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(params: CreateProjectUsecaseParams): Promise<Project> {
    console.log('CreateProjectUsecaseImpl.execute called with params:', params);

    const project = {
      name: params.name,
      description: params.description,
      teamId: params.teamId,
      status: params.status,
      userId: params.userId,
      roleId: params.roleId,
    };

    return await this.transactionManager.run(async () => {
      const projectData = await this.projectRepository.create(project);

      await this.membershipRepository.create({
        userId: String(project.userId),
        scopeType: ScopeType.PROJECT,
        scopeId: projectData.id,
        roleId: project.roleId,
        override: true,
      });

      await this.statusRepository.createMany(
        buildDefaultStatuses(projectData.id),
      );

      return projectData;
    });
  }
}
