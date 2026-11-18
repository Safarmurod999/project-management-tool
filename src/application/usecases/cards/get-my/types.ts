import { AssignedCardGetResponse } from 'src/domain';

export interface GetMyCardsUsecaseParams {
  /** The authenticated user; always taken from the token, never the query. */
  userId: string;
  /** Default 1. */
  page?: number;
  /** Default 10, at most 100. */
  limit?: number;
  projectId?: string;
  statusId?: string;
  title?: string;
  done?: boolean;
}

export interface GetMyCardsUsecase {
  execute(params: GetMyCardsUsecaseParams): Promise<AssignedCardGetResponse>;
}
