import { User } from "src/domain";

export interface CreateUserUsecaseParams {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserUsecase {
  execute(params: CreateUserUsecaseParams): Promise<User>;
}