import { Membership } from 'src/domain';
import { ScopeType } from 'src/infrastructure/common/enum';

export interface UpdateMembershipUsecaseParams {
  id: string;
  userId?: string;
  scopeType?: ScopeType;
  scopeId?: string;
  roleId?: string;
}

export interface UpdateMembershipUsecase {
  execute(params: UpdateMembershipUsecaseParams): Promise<Membership>;
}
