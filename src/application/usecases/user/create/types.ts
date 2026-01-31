import { User } from "src/domain";
import { UserStatus } from "src/infrastructure/common/enum";

export interface CreateUserUsecaseParams {
  name: string;
  email: string;
  role: string;
  password: string;
  status?: UserStatus;
}

export interface CreateUserUsecase {
  execute(params: CreateUserUsecaseParams): Promise<User>;
}
