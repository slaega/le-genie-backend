import { CreateEmptyPostCommand } from '#applications/commands/post/create-empty-post.command';
import {
    Controller,
    Post,
    Body,
    Delete,
    Put,
    Param,
    UseGuards,
    Get,
    Query,
    Patch,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '../auth/auth.decorator';
import { UpdatePostCommand } from '#applications/commands/post/update-post.command';
import { DeletePostCommand } from '#applications/commands/post/delete-post.command';
import { AuthUser } from '../auth/auth.type';
import { UpdatePostDto } from '#dto/post/update-post.dto';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/guards/auth.guard';
import { PostParamDto } from '#dto/post/post-param.dto';
import { GetPostQuery } from '#applications/query/post/get-post.query';
import { GetPostsQuery } from '#applications/query/post/get-posts.query';
import { PostQueryDto } from '#dto/post/post-query.dto';
import { PostResponseDto } from '#dto/post/post-response.dto';
import { PostMapper } from '#domain/mappers/post/post.mapper';
import { ChangePostStatusCommand } from '#applications/commands/post/change-post-status.command';
import { UpdatePostStatusDto } from '#dto/post/update-post-status.dto';

@Controller('posts')
export class PostController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Auth() user: AuthUser): Promise<PostResponseDto> {
        const post = await this.commandBus.execute(
            new CreateEmptyPostCommand(user.sub)
        );
        return PostMapper.toDto(post);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':postId')
    async update(
        @Param('postId') postId: string,
        @Body() updatePostDto: UpdatePostDto,
        @Auth() user: AuthUser
    ) {
        const post = await this.commandBus.execute(
            new UpdatePostCommand(
                postId,
                user.sub,
                updatePostDto.title,
                updatePostDto.content
            )
        );
        return PostMapper.toDto(post);
    }
    @UseGuards(JwtAuthGuard)
    @Patch(':postId/status')
    async updatePostStatus(
        @Param('postId') postId: string,
        @Body() updatePostStatusDto: UpdatePostStatusDto,
        @Auth() user: AuthUser
    ) {
        const post = await this.commandBus.execute(
            new ChangePostStatusCommand(
                postId,
                updatePostStatusDto.status,
                user.sub
            )
        );
        return PostMapper.toDto(post);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':postId')
    delete(@Param('postId') postId: string, @Auth() user: AuthUser) {
        return this.commandBus.execute(new DeletePostCommand(postId, user.sub));
    }

    @Get(':postId')
    @UseGuards(OptionalJwtAuthGuard)
    async getPost(@Param() param: PostParamDto, @Auth() user: AuthUser | null) {
        const post = await this.queryBus.execute(
            new GetPostQuery(param.postId, user?.sub ? 'ALL' : 'PUBLISHED')
        );
        return PostMapper.toDto(post);
    }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    async getPosts(
        @Query() query: PostQueryDto,
        @Auth() user: AuthUser | null
    ) {
        const page = parseInt(query.page ?? '1', 10);
        const limit = parseInt(query.limit ?? '10', 10);
        const authId = query.me ? user?.sub : undefined;
        const posts = await this.queryBus.execute(
            new GetPostsQuery(
                page,
                limit,
                { tags: query.tags },
                query.sort,
                authId
            )
        );
        return {
            items: posts.items.map((post) => PostMapper.toDto(post)),
            total: posts.total,
            page: posts.page,
            limit: posts.limit,
        };
    }
}
