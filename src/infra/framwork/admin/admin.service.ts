import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginationQuery, UpdateUserDto } from './admin.dto';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    totalSubscribers: number;
    totalFollows: number;
    postsByStatus: {
        PUBLISHED: number;
        DRAFT: number;
        EMPTY: number;
        ARCHIVED: number;
    };
}

export interface AdminUserRow {
    id: string;
    name: string;
    email: string;
    avatarPath: string | null;
    role: string;
    suspended: boolean;
    createdAt: Date;
    _count: { contributors: number; comments: number };
}

export interface AdminPostRow {
    id: string;
    title: string;
    status: string;
    readingTime: number | null;
    createdAt: Date;
    updatedAt: Date;
    contributors: unknown[];
    _count: { comments: number; likes: number };
}

export interface SubscriberRow {
    id: string;
    email: string;
    createdAt: Date;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) {}

    // ─── Stats ────────────────────────────────────────────────────────────

    async getStats(): Promise<AdminStats> {
        const [
            totalUsers,
            totalPosts,
            totalComments,
            totalSubscribers,
            totalFollows,
            recentPosts,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
            this.prisma.comment.count(),
            this.prisma.subscriber.count(),
            this.prisma.follow.count(),
            this.prisma.post.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
        ]);

        const byStatus = Object.fromEntries(
            recentPosts.map((r) => [r.status, r._count.id])
        );

        return {
            totalUsers,
            totalPosts,
            totalComments,
            totalSubscribers,
            totalFollows,
            postsByStatus: {
                PUBLISHED: byStatus['PUBLISHED'] ?? 0,
                DRAFT: byStatus['DRAFT'] ?? 0,
                EMPTY: byStatus['EMPTY'] ?? 0,
                ARCHIVED: byStatus['ARCHIVED'] ?? 0,
            },
        };
    }

    // ─── Users ────────────────────────────────────────────────────────────

    async listUsers(
        params: PaginationQuery & { search?: string }
    ): Promise<PaginatedResult<AdminUserRow>> {
        const page = Math.max(1, Number(params.page ?? 1));
        const limit = Math.min(50, Math.max(1, Number(params.limit ?? 20)));
        const skip = (page - 1) * limit;

        const where = params.search
            ? {
                  OR: [
                      {
                          name: {
                              contains: params.search,
                              mode: 'insensitive' as const,
                          },
                      },
                      {
                          email: {
                              contains: params.search,
                              mode: 'insensitive' as const,
                          },
                      },
                  ],
              }
            : {};

        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarPath: true,
                    role: true,
                    suspended: true,
                    createdAt: true,
                    _count: {
                        select: { contributors: true, comments: true },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            items: items as AdminUserRow[],
            total,
            page,
            limit,
            hasNextPage: skip + items.length < total,
        };
    }

    async updateUser(id: string, dto: UpdateUserDto): Promise<AdminUserRow> {
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                ...(dto.role !== undefined && { role: dto.role }),
                ...(dto.suspended !== undefined && { suspended: dto.suspended }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                suspended: true,
            },
        });
        return updated as unknown as AdminUserRow;
    }

    // ─── Posts ────────────────────────────────────────────────────────────

    async listPosts(
        params: PaginationQuery & { status?: string; search?: string }
    ): Promise<PaginatedResult<AdminPostRow>> {
        const page = Math.max(1, Number(params.page ?? 1));
        const limit = Math.min(50, Math.max(1, Number(params.limit ?? 20)));
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (params.status) where['status'] = params.status;
        if (params.search) {
            where['OR'] = [
                {
                    title: {
                        contains: params.search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        const [items, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    readingTime: true,
                    createdAt: true,
                    updatedAt: true,
                    contributors: {
                        where: { owner: true },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                        take: 1,
                    },
                    _count: { select: { comments: true, likes: true } },
                },
            }),
            this.prisma.post.count({ where }),
        ]);

        return {
            items: items as AdminPostRow[],
            total,
            page,
            limit,
            hasNextPage: skip + items.length < total,
        };
    }

    async archivePost(id: string): Promise<{ id: string; status: string }> {
        return this.prisma.post.update({
            where: { id },
            data: { status: 'ARCHIVED' },
            select: { id: true, status: true },
        }) as Promise<{ id: string; status: string }>;
    }

    async deletePost(id: string): Promise<{ success: boolean }> {
        await this.prisma.post.delete({ where: { id } });
        return { success: true };
    }

    // ─── Subscribers ──────────────────────────────────────────────────────

    async listSubscribers(
        params: PaginationQuery
    ): Promise<PaginatedResult<SubscriberRow>> {
        const page = Math.max(1, Number(params.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(params.limit ?? 30)));
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.subscriber.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.subscriber.count(),
        ]);

        return {
            items: items as SubscriberRow[],
            total,
            page,
            limit,
            hasNextPage: skip + items.length < total,
        };
    }

    async deleteSubscriber(id: string): Promise<{ success: boolean }> {
        await this.prisma.subscriber.delete({ where: { id } });
        return { success: true };
    }
}
