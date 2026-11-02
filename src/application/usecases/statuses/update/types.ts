import { Status } from 'src/domain';

export interface UpdateStatusUsecaseParams {
  id: string;
  name?: string;
  code?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
  version?: number;
}

export interface UpdateStatusUsecase {
  execute(params: UpdateStatusUsecaseParams): Promise<Status>;
}
