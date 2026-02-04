import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../helpers/token-service';
import { ServiceSymbols } from '../dependency-injection';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(ServiceSymbols.TokenService)
    private tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
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

    request.user = {
      id: payload.userId,
      role: 'super_admin',
      permissions: payload.permissions,
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
  }
}
