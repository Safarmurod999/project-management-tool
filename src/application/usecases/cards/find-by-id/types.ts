import { Card } from 'src/domain';

export interface FindCardByIdUsecaseParams {
  id: string;
}

export interface FindCardByIdUsecase {
  execute(params: FindCardByIdUsecaseParams): Promise<Card>;
}
