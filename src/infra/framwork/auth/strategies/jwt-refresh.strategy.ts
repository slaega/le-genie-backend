import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '#config/config.type';
import { AuthErrors } from '../auth.errors';
import { RefreshTokenRepository } from '#domain/repository/refresh-token.repository';
import { REFRESH_TOKEN_REPOSITORY } from '#shared/constantes/inject-token';
type JwtRefreshTokenPayloadType = {
  userId: string;
  token: string;
};
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService<AllConfigType>,

    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('auth.refreshTokenJwtSecret', {
        infer: true,
      }),
      ignoreExpiration: false,
    });
  }

  public async validate(
    payload: JwtRefreshTokenPayloadType,
  ): Promise<JwtRefreshTokenPayloadType> {
    const refreshToken = await this.refreshTokenRepository.findRefreshToken(
      payload.userId,
      payload.token,
    );
    if (!refreshToken) {
      throw new UnauthorizedException({
        errors: [AuthErrors.INVALID_TOKEN],
      });
    }
    return payload;
  }
}
