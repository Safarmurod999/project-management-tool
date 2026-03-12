import { Membership } from 'src/domain';
import { ScopeType } from 'src/infrastructure/common/enum';

export interface GetMembershipsUsecaseParams {
  page?: number;
  limit?: number;
  userId?: string;
  scopeType?: ScopeType;
  scopeId?: string;
  roleId?: string;
}

export interface GetMembershipsUsecaseResult {
  data: Membership[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface GetMembershipsUsecase {
  execute(params: GetMembershipsUsecaseParams): Promise<GetMembershipsUsecaseResult>;
}
