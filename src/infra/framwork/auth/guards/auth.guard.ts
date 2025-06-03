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
