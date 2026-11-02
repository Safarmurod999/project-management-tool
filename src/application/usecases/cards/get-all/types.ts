import { CardGetResponse } from 'src/domain';

export interface GetCardsUsecaseParams {
  page?: number;
  limit?: number;
  columnId: string;
  title?: string;
  statusId?: string;
}

export interface GetCardsUsecase {
  execute(params: GetCardsUsecaseParams): Promise<CardGetResponse>;
}
