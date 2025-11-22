import { User } from "src/domain";

export interface FindUserByIdUsecaseParams {
  id: string;
}

export interface FindUserByIdUsecase {
  execute(params: FindUserByIdUsecaseParams): Promise<User>;
}