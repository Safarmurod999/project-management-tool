import { Team } from 'src/domain';
import { TeamStatus } from 'src/infrastructure/common/enum';

export interface UpdateTeamUsecaseParams {
  id: string;
  name?: string;
  description?: string | null;
  ownerId?: string;
  status?: TeamStatus;
}

export interface UpdateTeamUsecase {
  execute(params: UpdateTeamUsecaseParams): Promise<Team>;
}
