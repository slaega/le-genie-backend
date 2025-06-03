import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '#config/config.type';
import { AuthErrors } from '../auth.errors';
export type JwtAccessTokenPayloadType = {
    sub: string;
    email: string;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor(configService: ConfigService<AllConfigType>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('auth.accessTokenJwtSecret', {
                infer: true,
            }),
            ignoreExpiration: false,
        });
    }

    public validate(
        payload: JwtAccessTokenPayloadType
    ): JwtAccessTokenPayloadType {
        if (!payload) {
            throw new UnauthorizedException({
                errors: [AuthErrors.INVALID_TOKEN],
            });
        }
        return payload;
    }
}
