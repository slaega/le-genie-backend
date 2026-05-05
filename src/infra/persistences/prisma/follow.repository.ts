import { Injectable } from '@nestjs/common';
import { FollowRepository, FollowingAuthor } from '#domain/repository/follow.repository';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';

@Injectable()
export class FollowPrismaRepository implements FollowRepository {
    constructor(private readonly prisma: PrismaService) {}

    async follow(followerId: string, authorId: string): Promise<void> {
        await this.prisma.follow.upsert({
            where: { followerId_authorId: { followerId, authorId } },
            create: { followerId, authorId },
            update: {},
        });
    }

    async unfollow(followerId: string, authorId: string): Promise<void> {
        await this.prisma.follow.deleteMany({
            where: { followerId, authorId },
        });
    }

    async isFollowing(followerId: string, authorId: string): Promise<boolean> {
        return !!(await this.prisma.follow.findUnique({
            where: { followerId_authorId: { followerId, authorId } },
        }));
    }

    async getFollowerEmails(authorId: string): Promise<string[]> {
        const rows = await this.prisma.follow.findMany({
            where: { authorId },
            include: { follower: { select: { email: true } } },
        });
        return rows.map((r) => r.follower.email);
    }

    async getFollowingIds(followerId: string): Promise<string[]> {
        const rows = await this.prisma.follow.findMany({
            where: { followerId },
            select: { authorId: true },
        });
        return rows.map((r) => r.authorId);
    }

    async getFollowersCount(authorId: string): Promise<number> {
        return this.prisma.follow.count({ where: { authorId } });
    }

    async getFollowing(followerId: string): Promise<FollowingAuthor[]> {
        const rows = await this.prisma.follow.findMany({
            where: { followerId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarPath: true,
                        professionalRole: true,
                        _count: { select: { followers: true } },
                    },
                },
            },
        });
        return rows.map((r) => ({
            id: r.author.id,
            name: r.author.name,
            avatarPath: r.author.avatarPath ?? null,
            professionalRole: r.author.professionalRole ?? null,
            followersCount: r.author._count.followers,
        }));
    }
}
