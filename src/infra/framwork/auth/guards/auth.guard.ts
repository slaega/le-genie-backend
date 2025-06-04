/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthErrors } from '../auth.errors';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {
    handleRequest(err, payload, info) {
        if (err || !payload) {
            if (info && info.name === 'TokenExpiredError') {
                throw new UnauthorizedException({
                    errors: AuthErrors.TOKEN_EXPIRED,
                });
            } else {
                throw new UnauthorizedException({
                    errors: AuthErrors.INVALID_TOKEN,
                });
            }
        }
        return payload;
    }
}
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt-access') {
    handleRequest(err, user, info) {
        // Si le token est valide, retourne le user
        if (user) return user;

        // Si pas de token, ou token invalide, on ne lance PAS d'exception
        return null;
    }
}
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
    handleRequest(err, payload, info) {
        if (err || !payload) {
            if (info && info.name === 'TokenExpiredError') {
                throw new UnauthorizedException({
                    errors: AuthErrors.TOKEN_EXPIRED,
                });
            } else {
                throw new UnauthorizedException({
                    errors: AuthErrors.INVALID_TOKEN,
                });
            }
        }
        return payload;
    }
}
