import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Given a userId (string), generate a signed JWT payload.
   */
  private generateAccessToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload, {
      expiresIn: '1h', // or your chosen expiry
    });
  }

  /**
   * (Optional) If you want to issue a refresh token too:
   */
  private generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        expiresIn: '7d',
      },
    );
  }

  generateTokens(
    userId: string,
    email: string,
  ): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = this.generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }
}
