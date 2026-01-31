import { User } from "src/domain";

export interface RegisterUserUsecaseParams {
  name: string;
  email: string;
  password: string;
  role: string;
}

export type RegisterUserUsecaseResult = User;

export interface RegisterUserUsecase {
  execute(params: RegisterUserUsecaseParams): Promise<RegisterUserUsecaseResult>;
}
