export interface LoginUserUsecaseParams {
  email: string;
  password: string;
}

export interface LoginUserUsecaseResult {
    access_token: string;
    refresh_token: string;
};

export interface LoginUserUsecase {
  execute(params: LoginUserUsecaseParams): Promise<LoginUserUsecaseResult>;
}
