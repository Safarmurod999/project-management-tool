export interface RefreshTokenUsecaseResult {
  access_token: string;
}

export interface RefreshTokenUsecase {
  execute(refreshToken: string): Promise<RefreshTokenUsecaseResult>;
}