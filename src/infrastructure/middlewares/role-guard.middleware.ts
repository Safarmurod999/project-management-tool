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
import { UserRepository, RolePermissionRepository } from 'src/domain';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(ServiceSymbols.TokenService)
    private tokenService: TokenService,
    @Inject(RepositorySymbols.UserRepository)
    private userRepository: UserRepository,
    @Inject(RepositorySymbols.RolePermissionRepository)
    private rolePermissionRepository: RolePermissionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

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

    // Fetch user from database with populated role
    try {
      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        return false;
      }      

      // Fetch permissions for user's role
      const permissions = await this.rolePermissionRepository.getPermissionsByRoleId(
        user.role.id,
      );      
            
      request.user = {
        id: user.id,
        email: user.email,
        role: user.role.code,
        permissions: permissions.map((p) => p.code),
      };

      if (requiredRoles && !requiredRoles.includes(request.user.role)) {
        return false;
      }
      
      if (
        requiredPermissions &&
        !request.user.permissions.some((p) => requiredPermissions.includes(p))
      )
        return false;

      return true;
    } catch {
      return false;
    }
  }
}
