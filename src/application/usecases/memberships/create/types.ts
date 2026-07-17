import { Membership } from 'src/domain';
import { ScopeType } from 'src/infrastructure/common/enum';

export interface CreateMembershipUsecaseParams {
  userId: string;
  scopeType: ScopeType;
  scopeId: string;
  roleId: string;
  override?: boolean;
}

export interface CreateMembershipUsecase {
  execute(params: CreateMembershipUsecaseParams): Promise<Membership>;
}
