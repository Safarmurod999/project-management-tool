import { Status } from 'src/domain';

export interface FindStatusByIdUsecaseParams {
  id: string;
}

export interface FindStatusByIdUsecase {
  execute(params: FindStatusByIdUsecaseParams): Promise<Status>;
}
