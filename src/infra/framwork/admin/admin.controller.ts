import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from './admin.guard';
import { PrismaService } from '../common/prisma/prisma.service';
import { IsEnum, IsOptional, IsString } from 'class-validator';

class PaginationQuery {
    @IsOptional()
    page?: string;

    @IsOptional()
    limit?: string;
}

class UpdateUserDto {
    @IsOptional()
    @IsEnum(['USER', 'ADMIN'])
    role?: 'USER' | 'ADMIN';

    @IsOptional()
    suspended?: boolean;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly prisma: PrismaService) {}

    // ─── Stats ────────────────────────────────────────────────────────────────

    @Get('stats')
    async stats() {
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

    // ─── Users ────────────────────────────────────────────────────────────────

    @Get('users')
    async listUsers(@Query() q: PaginationQuery & { search?: string }) {
        const page = Math.max(1, Number(q.page ?? 1));
        const limit = Math.min(50, Math.max(1, Number(q.limit ?? 20)));
        const skip = (page - 1) * limit;

        const where = q.search
            ? {
                  OR: [
                      { name: { contains: q.search } },
                      { email: { contains: q.search } },
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
            items,
            total,
            page,
            limit,
            hasNextPage: skip + items.length < total,
        };
    }

    @Patch('users/:id')
    async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
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
        return updated;
    }

    // ─── Posts ────────────────────────────────────────────────────────────────

    @Get('posts')
    async listPosts(
        @Query() q: PaginationQuery & { status?: string; search?: string }
    ) {
        const page = Math.max(1, Number(q.page ?? 1));
        const limit = Math.min(50, Math.max(1, Number(q.limit ?? 20)));
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (q.status) where['status'] = q.status;
        if (q.search) {
            where['OR'] = [
                { title: { contains: q.search } },
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
                            user: { select: { id: true, name: true, email: true } },
                        },
                        take: 1,
                    },
                    _count: { select: { comments: true, likes: true } },
                },
            }),
            this.prisma.post.count({ where }),
        ]);

        return {
            items,
            total,
            page,
            limit,
            hasNextPage: skip + items.length < total,
        };
    }

    @Patch('posts/:id/archive')
    async archivePost(@Param('id') id: string) {
        return this.prisma.post.update({
            where: { id },
            data: { status: 'ARCHIVED' },
            select: { id: true, status: true },
        });
    }

    @Delete('posts/:id')
    async deletePost(@Param('id') id: string) {
        await this.prisma.post.delete({ where: { id } });
        return { success: true };
    }

    // ─── Subscribers ──────────────────────────────────────────────────────────

    @Get('subscribers')
    async listSubscribers(@Query() q: PaginationQuery) {
        const page = Math.max(1, Number(q.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(q.limit ?? 30)));
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
            items,
            total,
            page,
            limit,
            hasNextPage: skip + items.length < total,
        };
    }

    @Delete('subscribers/:id')
    async deleteSubscriber(@Param('id') id: string) {
        await this.prisma.subscriber.delete({ where: { id } });
        return { success: true };
    }
}
