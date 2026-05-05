import { GetPostsQuery } from '#applications/query/post/get-posts.query';
import { GetPostQuery } from '#applications/query/post/get-post.query';
import { SearchPostsQuery } from '#applications/query/post/search-posts.query';
import { PostMapper } from '#domain/mappers/post/post.mapper';
import { PostQueryDto } from '#dto/post/post-query.dto';
import { PostStatus } from '#shared/enums/post-status.enum';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

/**
 * Public headless CMS content delivery API.
 * No authentication required — only serves PUBLISHED content.
 * Designed for consumption by Next.js, mobile apps, and external integrations.
 */
@ApiTags('cms')
@Controller('cms')
export class CmsController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly prisma: PrismaService,
    ) {}

    @Get('posts')
    @ApiOperation({ summary: 'List published posts (public, no auth)' })
    async listPosts(@Query() query: PostQueryDto) {
        const page = parseInt(query.page ?? '1', 10);
        const limit = Math.min(parseInt(query.limit ?? '12', 10), 50);

        const result = await this.queryBus.execute(
            new GetPostsQuery(
                page,
                limit,
                { tags: query.tags, status: PostStatus.PUBLISHED },
                query.sort ?? 'recent'
            )
        );
        return {
            items: result.items.map(PostMapper.toDto),
            total: result.total,
            page: result.page,
            limit: result.limit,
            hasNextPage: result.hasNextPage,
        };
    }

    // ─── Sidebar endpoints ────────────────────────────────────────────────────

    @Get('stats')
    @ApiOperation({ summary: 'Global statistics for the homepage sidebar' })
    async getStats() {
        const [totalPosts, totalAuthors, totalTags, totalComments] =
            await Promise.all([
                this.prisma.post.count(),
                this.prisma.user.count(),
                this.prisma.tag.count(),
                this.prisma.comment.count(),
            ]);
        return { totalPosts, totalAuthors, totalTags, totalComments };
    }

    @Get('tags')
    @ApiOperation({ summary: 'Tags list with their post count (top 20)' })
    async getTags() {
        const tags = await this.prisma.tag.findMany({
            include: {
                _count: { select: { posts: true } },
            },
            orderBy: { posts: { _count: 'desc' } },
            take: 20,
        });
        return {
            items: tags.map((t) => ({ name: t.name, count: t._count.posts })),
        };
    }

    @Get('authors')
    @ApiOperation({ summary: 'Top authors (owner contributors) with post count' })
    async getAuthors() {
        const users = await this.prisma.user.findMany({
            where: {
                contributors: { some: { owner: true } },
            },
            include: {
                _count: {
                    select: {
                        contributors: { where: { owner: true } },
                    },
                },
            },
            orderBy: { contributors: { _count: 'desc' } },
            take: 20,
        });
        return {
            items: users.map((u) => ({
                id: u.id,
                name: u.name,
                avatarPath: u.avatarPath ?? null,
                professionalRole: u.professionalRole ?? null,
                postCount: u._count.contributors,
            })),
        };
    }

    // ─── Post endpoints ───────────────────────────────────────────────────────

    @Get('posts/search')
    @ApiOperation({ summary: 'Full-text search on published posts' })
    @ApiQuery({ name: 'q', required: true, description: 'Search query' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async searchPosts(
        @Query('q') q: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const p = parseInt(page ?? '1', 10);
        const l = Math.min(parseInt(limit ?? '12', 10), 50);
        const result = await this.queryBus.execute(
            new SearchPostsQuery(q ?? '', p, l)
        );
        return {
            items: result.items.map(PostMapper.toDto),
            total: result.total,
            page: result.page,
            limit: result.limit,
            hasNextPage: result.hasNextPage,
        };
    }

    @Get('posts/:id')
    @ApiOperation({ summary: 'Get a published post by ID (public, no auth)' })
    async getPost(@Param('id') id: string) {
        const post = await this.queryBus.execute(
            new GetPostQuery(id, PostStatus.PUBLISHED)
        );
        return PostMapper.toDto(post);
    }

    @Get('posts/:id/related')
    @ApiOperation({ summary: 'Get related posts based on tags' })
    async getRelated(@Param('id') id: string) {
        const post = await this.queryBus.execute(
            new GetPostQuery(id, PostStatus.PUBLISHED)
        );
        const dto = PostMapper.toDto(post);
        const tags = (dto.postTags as { name: string }[]).map((t) => t.name);

        if (!tags.length) return { items: [] };

        const result = await this.queryBus.execute(
            new GetPostsQuery(
                1,
                4,
                { tags, status: PostStatus.PUBLISHED },
                'recent'
            )
        );
        return {
            items: result.items
                .filter((p) => p.id !== id)
                .slice(0, 3)
                .map(PostMapper.toDto),
        };
    }
}
