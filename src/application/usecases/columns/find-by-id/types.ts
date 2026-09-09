import { Column } from 'src/domain';

export interface FindColumnByIdUsecaseParams {
  id: string;
}

export interface FindColumnByIdUsecase {
  execute(params: FindColumnByIdUsecaseParams): Promise<Column>;
}
