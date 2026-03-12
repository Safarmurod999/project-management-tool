import { Membership } from 'src/domain';

export interface FindMembershipByIdUsecaseParams {
  id: string;
}

export interface FindMembershipByIdUsecase {
  execute(params: FindMembershipByIdUsecaseParams): Promise<Membership>;
}
