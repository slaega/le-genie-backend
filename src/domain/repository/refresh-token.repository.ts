import { RefreshToken } from '#domain/entities/refresh-token.entity';

export interface RefreshTokenRepository {
  findRefreshToken(userId: string, token: string): Promise<RefreshToken | null>;
  removeRefreshToken(userId: string, token: string): Promise<void>;
  createRefreshToken(refreshToken: RefreshToken): Promise<RefreshToken>;
}
