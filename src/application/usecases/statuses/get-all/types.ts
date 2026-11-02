import { StatusGetResponse } from 'src/domain';

export interface GetStatusesUsecaseParams {
  page?: number;
  limit?: number;
  projectId: string;
  name?: string;
  code?: string;
}

export interface GetStatusesUsecase {
  execute(params: GetStatusesUsecaseParams): Promise<StatusGetResponse>;
}
