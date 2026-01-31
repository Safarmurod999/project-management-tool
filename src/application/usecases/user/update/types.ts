import { User } from "src/domain";
import { UserStatus } from "src/infrastructure/common/enum";

export interface UpdateUserUsecaseParams {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  isVerified: boolean;
  status: UserStatus;
}

export interface UpdateUserUsecase {
  execute(params: UpdateUserUsecaseParams): Promise<User>;
}
