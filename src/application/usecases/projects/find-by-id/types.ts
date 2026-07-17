import { Project } from 'src/domain';

export interface FindProjectByIdUsecaseParams {
  id: string;
}

export interface FindProjectByIdUsecase {
  execute(params: FindProjectByIdUsecaseParams): Promise<Project>;
}
