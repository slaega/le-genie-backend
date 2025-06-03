import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '#config/config.type';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  /**
   * Given a userId (string), generate a signed JWT payload.
   */
  private generateAccessToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.getOrThrow('auth.accessTokenJwtExpiresIn', {
        infer: true,
      }),
      secret: this.configService.getOrThrow('auth.accessTokenJwtSecret', {
        infer: true,
      }),
    });
  }

  /**
   * (Optional) If you want to issue a refresh token too:
   */
  private generateRefreshToken(userId: string, token: string): string {
    return this.jwtService.sign(
      { sub: userId, token },
      {
        expiresIn: this.configService.getOrThrow(
          'auth.refreshTokenJwtExpiresIn',
          {
            infer: true,
          },
        ),
        secret: this.configService.getOrThrow('auth.refreshTokenJwtSecret', {
          infer: true,
        }),
      },
    );
  }

  generateTokens(
    userId: string,
    email: string,
    token: string,
  ): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = this.generateRefreshToken(userId, token);
    return { accessToken, refreshToken };
  }
}
