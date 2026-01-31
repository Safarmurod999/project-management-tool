import { User } from "src/domain";

export interface UpdateUserUsecaseParams {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  isVerified: boolean;
}

export interface UpdateUserUsecase {
  execute(params: UpdateUserUsecaseParams): Promise<User>;
}
