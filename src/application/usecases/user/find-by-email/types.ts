import { User } from "src/domain";

export interface FindUserByEmailUsecaseParams {
  email: string;
}

export interface FindUserByEmailUsecase {
  execute(params: FindUserByEmailUsecaseParams): Promise<User>;
}