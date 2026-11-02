import { Status } from 'src/domain';

export interface CreateStatusUsecaseParams {
  projectId: string;
  name: string;
  code?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
}

export interface CreateStatusUsecase {
  execute(params: CreateStatusUsecaseParams): Promise<Status>;
}
