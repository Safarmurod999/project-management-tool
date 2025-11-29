export interface VerifyUserUsecaseParams {
    token: string;
    id: string;
}

export interface VerifyUserUsecaseResult {
    access_token: string;
    refresh_token: string;
}

export interface VerifyUserUsecase {
    execute(params: VerifyUserUsecaseParams): Promise<VerifyUserUsecaseResult>;
}