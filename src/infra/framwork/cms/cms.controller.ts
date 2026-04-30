import { GetPostsQuery } from '#applications/query/post/get-posts.query';
import { GetPostQuery } from '#applications/query/post/get-post.query';
import { PostMapper } from '#domain/mappers/post/post.mapper';
import { PostQueryDto } from '#dto/post/post-query.dto';
import { PostStatus } from '#shared/enums/post-status.enum';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Public headless CMS content delivery API.
 * No authentication required — only serves PUBLISHED content.
 * Designed for consumption by Next.js, mobile apps, and external integrations.
 */
@ApiTags('cms')
@Controller('cms')
export class CmsController {
    constructor(private readonly queryBus: QueryBus) {}

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
        const tags = dto.postTags.map((t: { name: string }) => t.name);

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
