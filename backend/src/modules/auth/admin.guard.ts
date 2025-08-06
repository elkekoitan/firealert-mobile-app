// AdminGuard
// Amaç: JwtAuthGuard sonrası req.user.app_metadata.role === 'admin' kontrolü.
// Şimdilik JwtAuthGuard mock user set ediyor; JWKS sonrası gerçek role okunacak.

import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const role = req?.user?.app_metadata?.role;
    if (role !== 'admin') {
      throw new ForbiddenException('Admin role required');
    }
    return true;
  }
}
