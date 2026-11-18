import { AssignedCardStats } from 'src/domain';

export interface GetMyCardStatsUsecaseParams {
  /** The authenticated user; always taken from the token. */
  userId: string;
  projectId?: string;
}

export interface GetMyCardStatsUsecase {
  execute(params: GetMyCardStatsUsecaseParams): Promise<AssignedCardStats>;
}
