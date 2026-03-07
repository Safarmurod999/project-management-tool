import { Team, TeamStruct } from 'src/domain';

export interface FindTeamByIdPresenter {
  present(team: Team): TeamStruct;
}

export class FindTeamByIdPresenterImpl implements FindTeamByIdPresenter {
  present(team: Team): TeamStruct {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      ownerId: team.ownerId,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      status: team.status,
    };
  }
}
