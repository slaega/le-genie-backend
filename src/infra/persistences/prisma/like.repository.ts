import { Injectable } from '@nestjs/common';
import { PrismaProxyRepository } from '#infra/persistences/prisma/prisma';
import {
    LikeRepository,
    LikeStats,
} from '#domain/repository/like.repository';
import { Like } from '#domain/entities/like.entity';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class LikePrismaRepository
    extends PrismaProxyRepository<'like'>()
    implements LikeRepository
{
    constructor(prisma: PrismaClient) {
        super(prisma.like);
    }

    /**
     * Toggle = if (postId, fingerprint) row exists, delete it; otherwise create it.
     * Race-safe enough for our use case (no transaction needed — final state is idempotent).
     */
    async toggle(like: Like): Promise<boolean> {
        const existing = await this.findUnique({
            where: {
                postId_fingerprint: {
                    postId: like.postId,
                    fingerprint: like.fingerprint,
                },
            },
        });

        if (existing) {
            await this.delete({
                where: {
                    postId_fingerprint: {
                        postId: like.postId,
                        fingerprint: like.fingerprint,
                    },
                },
            });
            return false;
        }

        await this.create({
            data: {
                postId: like.postId,
                fingerprint: like.fingerprint,
                ip: like.ip,
                userAgent: like.userAgent,
                userId: like.userId,
            },
        });
        return true;
    }

    countByPost(postId: string): Promise<number> {
        return this.count({ where: { postId } });
    }

    async hasLiked(postId: string, fingerprint: string): Promise<boolean> {
        const found = await this.findUnique({
            where: {
                postId_fingerprint: { postId, fingerprint },
            },
        });
        return !!found;
    }

    async getStats(
        postId: string,
        fingerprint: string
    ): Promise<LikeStats> {
        const [count, liked] = await Promise.all([
            this.countByPost(postId),
            this.hasLiked(postId, fingerprint),
        ]);
        return { count, liked };
    }
}
