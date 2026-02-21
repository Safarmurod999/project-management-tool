export interface GetMeUsecaseParams {
  userId: string;
}

export interface GetMeUsecaseResult {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    code: string;
  };
  permissions: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export interface GetMeUsecase {
  execute(params: GetMeUsecaseParams): Promise<GetMeUsecaseResult>;
}
