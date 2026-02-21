import { User } from "src/domain";
import { RoleCode } from "src/infrastructure/common/enum";

export interface RegisterUserUsecaseParams {
  name: string;
  email: string;
  password: string;
}

export type RegisterUserUsecaseResult = User;

export interface RegisterUserUsecase {
  execute(params: RegisterUserUsecaseParams): Promise<RegisterUserUsecaseResult>;
}
