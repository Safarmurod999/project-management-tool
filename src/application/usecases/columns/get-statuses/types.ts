import { ColumnStatus, Status } from 'src/domain';

export interface GetColumnStatusesUsecaseParams {
  columnId: string;
}

export interface ColumnStatusDetails {
  columnStatus: ColumnStatus;
  status: Status;
}

export interface GetColumnStatusesUsecase {
  execute(
    params: GetColumnStatusesUsecaseParams,
  ): Promise<ColumnStatusDetails[]>;
}
