import { Injectable } from '@nestjs/common';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';

@Injectable()
export class RefreshTokenPrismaRepository {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  async getRefreshTokenByUserId(userId: string): Promise<any | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        userId,
      },
    });
  }
}
