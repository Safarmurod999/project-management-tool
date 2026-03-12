import { Team, TeamStruct } from 'src/domain';

export interface CreateTeamPresenter {
  present(team: Team): TeamStruct;
}

export class CreateTeamPresenterImpl implements CreateTeamPresenter {
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
