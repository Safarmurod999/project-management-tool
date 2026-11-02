export interface RemoveColumnStatusUsecaseParams {
  columnId: string;
  statusId: string;
}

export interface RemoveColumnStatusUsecase {
  execute(params: RemoveColumnStatusUsecaseParams): Promise<string>;
}
