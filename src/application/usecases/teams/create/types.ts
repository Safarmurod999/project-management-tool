import { Team } from 'src/domain';
import { TeamStatus } from 'src/infrastructure/common/enum';

export interface CreateTeamUsecaseParams {
  name: string;
  description: string | null;
  ownerId: string;
  status?: TeamStatus;
}

export interface CreateTeamUsecase {
  execute(params: CreateTeamUsecaseParams): Promise<Team>;
}
