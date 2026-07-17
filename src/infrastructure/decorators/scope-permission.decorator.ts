import { SetMetadata } from '@nestjs/common';
import { ScopeType } from '../common/enum';

export interface ScopePermissionMetadata {
  scopeType: ScopeType;
  scopeIdParam: string; // The name of the route parameter containing the scope ID
  permissions: string[];
}

export const SCOPE_PERMISSION_KEY = 'scope_permission';

export const ScopePermission = (
  scopeType: ScopeType,
  scopeIdParam: string,
  ...permissions: string[]
) =>
  SetMetadata(SCOPE_PERMISSION_KEY, {
    scopeType,
    scopeIdParam,
    permissions,
  } as ScopePermissionMetadata);
