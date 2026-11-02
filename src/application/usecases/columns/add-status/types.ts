import { ColumnStatusDetails } from '../get-statuses/types';

export interface AddColumnStatusUsecaseParams {
  columnId: string;
  statusId: string;
  order?: number;
}

export interface AddColumnStatusUsecase {
  execute(params: AddColumnStatusUsecaseParams): Promise<ColumnStatusDetails>;
}
