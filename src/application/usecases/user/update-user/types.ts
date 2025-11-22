import { User } from "src/domain";

export interface UpdateUserUsecaseParams {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserUsecase {
  execute(params: UpdateUserUsecaseParams): Promise<User>;
}