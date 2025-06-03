import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '#domain/repository/refresh-token.repository';
import { PrismaClient } from '@prisma/client';
import { PrismaProxyRepository } from '#infra/percistences/prisma/prisma';
import { RefreshToken } from '#domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenPrismaRepository
    extends PrismaProxyRepository<'refreshToken'>()
    implements RefreshTokenRepository
{
    constructor(prisma: PrismaClient) {
        super(prisma.refreshToken);
    }
    async findRefreshToken(
        userId: string,
        token: string
    ): Promise<RefreshToken | null> {
        return this.findUnique({
            where: {
                userId_token: {
                    userId,
                    token,
                },
            },
        });
    }
    async removeRefreshToken(userId: string, token: string): Promise<void> {
        await this.delete({
            where: {
                userId_token: {
                    userId,
                    token,
                },
            },
        });
    }
    createRefreshToken(refreshToken: RefreshToken): Promise<RefreshToken> {
        return this.create({
            data: refreshToken,
        });
    }
}
