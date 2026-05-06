import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { AuthUser } from '../auth/auth.type';

/**
 * AdminGuard — used on top of JwtAuthGuard.
 * Checks that the authenticated user has the ADMIN role in their JWT payload.
 */
@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
        const user = request.user;

        if (!user || user.role !== 'ADMIN') {
            throw new ForbiddenException('Admin access required');
        }
        return true;
    }
}
