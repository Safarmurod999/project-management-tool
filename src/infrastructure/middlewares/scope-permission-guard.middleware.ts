import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../helpers/token-service';
import { ServiceSymbols, RepositorySymbols } from '../dependency-injection';
import {
  MembershipRepository,
  RolePermissionRepository,
} from 'src/domain';
import { SCOPE_PERMISSION_KEY, ScopePermissionMetadata } from '../decorators';

@Injectable()
export class ScopePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(ServiceSymbols.TokenService)
    private tokenService: TokenService,
    @Inject(RepositorySymbols.MembershipRepository)
    private membershipRepository: MembershipRepository,
    @Inject(RepositorySymbols.RolePermissionRepository)
    private rolePermissionRepository: RolePermissionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const scopePermissionMetadata = this.reflector.get<ScopePermissionMetadata>(
      SCOPE_PERMISSION_KEY,
      context.getHandler(),
    );

    // If no scope permission metadata, allow access (will be handled by RolesPermissionsGuard)
    if (!scopePermissionMetadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) return false;

    const token = authHeader.split(' ')[1];

    let payload;

    try {
      if (!this.tokenService.isValidToken(token, process.env.ACCESS_SECRET!)) {
        throw new UnauthorizedException();
      }

      payload = this.tokenService.parseToken<{ userId: string }>(token);
    } catch {
      return false;
    }

    try {
      const { scopeType, scopeIdParam, permissions: requiredPermissions } =
        scopePermissionMetadata;

      // Get the scope ID from route parameters
      const scopeId = request.params[scopeIdParam];
      if (!scopeId) {
        return false;
      }

      // Find membership for this user in the specified scope
      const membershipResult = await this.membershipRepository.find({
        userId: payload.userId,
        scopeType,
        scopeId,
        page: 1,
        limit: 1,
      });

      if (membershipResult.data.length === 0) {
        // User is not a member of this scope
        return false;
      }

      const membership = membershipResult.data[0];

      // Get permissions for the user's role in this scope
      const permissions =
        await this.rolePermissionRepository.getPermissionsByRoleId(
          membership.roleId,
        );

      const userPermissions = permissions.map((p) => p.code as string);

      // Check if user has required permissions
      const hasPermission = requiredPermissions.some((requiredPermission) =>
        userPermissions.includes(requiredPermission),
      );

      return hasPermission;
    } catch {
      return false;
    }
  }
}
