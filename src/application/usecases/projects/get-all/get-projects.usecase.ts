import { Inject } from '@nestjs/common';
import { MembershipRepository, ProjectRepository } from 'src/domain';
import { ScopeType } from 'src/infrastructure/common/enum';
import { RepositorySymbols } from 'src/infrastructure/dependency-injection/repositories/symbol';
import {
  GetProjectsUsecase,
  GetProjectsUsecaseParams,
  GetProjectsUsecaseResult,
} from './types';

export class GetProjectsUsecaseImpl implements GetProjectsUsecase {
  constructor(
    @Inject(RepositorySymbols.ProjectRepository)
    private readonly projectRepository: ProjectRepository,
    @Inject(RepositorySymbols.MembershipRepository)
    private readonly membershipRepository: MembershipRepository,
  ) {}

  async execute(
    params: GetProjectsUsecaseParams,
  ): Promise<GetProjectsUsecaseResult> {
    const [projectMemberships, teamMemberships] = await Promise.all([
      this.findAllMemberships(params.userId, ScopeType.PROJECT),
      this.findAllMemberships(params.userId, ScopeType.TEAM),
    ]);

    const projectIds = projectMemberships.map((membership) => membership.scopeId);
    const teamIds = teamMemberships.map((membership) => membership.scopeId);
    const myProjectIds = new Set(
      projectMemberships
        .filter((membership) => membership.override)
        .map((membership) => membership.scopeId),
    );

    const [projectsByMembership, projectsByTeam] = await Promise.all([
      this.projectRepository.findByIds(projectIds, params.name),
      this.projectRepository.findByTeamIds(teamIds, params.name),
    ]);

    const deduplicatedProjects = new Map<string, (typeof projectsByTeam)[number]>();
    for (const project of [...projectsByMembership, ...projectsByTeam]) {
      deduplicatedProjects.set(project.id, project);
    }

    const allRelevantProjects = Array.from(deduplicatedProjects.values());

    return {
      myProjects: allRelevantProjects.filter((project) => myProjectIds.has(project.id)),
      participatedProjects: allRelevantProjects.filter(
        (project) => !myProjectIds.has(project.id),
      ),
    };
  }

  private async findAllMemberships(userId: string, scopeType: ScopeType) {
    return await this.membershipRepository.findAll({
      userId,
      scopeType,
    });
  }
}
