import { Membership } from 'src/domain';
import { ScopeType } from 'src/infrastructure/common/enum';

export interface CreateMembershipUsecaseParams {
  userId: string;
  scopeType: ScopeType;
  scopeId: string;
  roleId: string;
  override?: boolean;
  /** The user adding the member; not notified about their own action. */
  actorId?: string;
}

export interface CreateMembershipUsecase {
  execute(params: CreateMembershipUsecaseParams): Promise<Membership>;
}
