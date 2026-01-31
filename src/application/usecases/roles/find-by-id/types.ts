import { Role } from "src/domain";

export interface FindRoleByIdUsecaseParams {
  id: string;
}

export interface FindRoleByIdUsecase {
  execute(params: FindRoleByIdUsecaseParams): Promise<Role>;
}
