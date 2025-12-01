import { User } from "src/domain";

export interface RegisterUserUsecaseParams {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserUsecaseResult extends User {}

export interface RegisterUserUsecase {
  execute(params: RegisterUserUsecaseParams): Promise<RegisterUserUsecaseResult>;
}