import { Team, TeamStruct } from 'src/domain';

export interface GetTeamsPresenter {
  present(teams: Team[]): TeamStruct[];
}

export class GetTeamsPresenterImpl implements GetTeamsPresenter {
  present(teams: Team[]): TeamStruct[] {
    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      ownerId: team.ownerId,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      status: team.status,
    }));
  }
}
