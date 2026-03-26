import { Inject } from '@nestjs/common';
import { MembershipRepository, Project, ProjectRepository } from 'src/domain';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import { CreateProjectUsecase, CreateProjectUsecaseParams } from './types';
import { ScopeType } from 'src/infrastructure/common/enum';

export class CreateProjectUsecaseImpl implements CreateProjectUsecase {
  constructor(
    @Inject(RepositorySymbols.ProjectRepository)
    private projectRepository: ProjectRepository,

    @Inject(RepositorySymbols.MembershipRepository)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(params: CreateProjectUsecaseParams): Promise<Project> {
    const project = {
      name: params.name,
      description: params.description,
      teamId: params.teamId,
      status: params.status,
      userId: params.userId,
      roleId: params.roleId
    };

    const projectData = await this.projectRepository.create(project);

    await this.membershipRepository.create({
      userId: String(project.userId),
      scopeType: ScopeType.PROJECT,
      scopeId: projectData.id,
      roleId: project.roleId,
      override: true,
    });

    return projectData;
  }
}
