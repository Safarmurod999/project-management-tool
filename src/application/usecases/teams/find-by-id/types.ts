import { Team } from 'src/domain';

export interface FindTeamByIdUsecaseParams {
  id: string;
}

export interface FindTeamByIdUsecase {
  execute(params: FindTeamByIdUsecaseParams): Promise<Team>;
}
