import { CreateEmptyPostCommand } from '#applications/commands/post/create-empty-post.command';
import { DeletePostCommand } from '#applications/commands/post/delete-post.command';
import { UpdatePostCommand } from '#applications/commands/post/update-post.command';
import { GetPostQuery } from '#applications/query/post/get-post.query';
import { GetPostsQuery } from '#applications/query/post/get-posts.query';
import { PostMapper } from '#domain/mappers/post/post.mapper';
import { PostParamDto } from '#dto/post/post-param.dto';
import { PostQueryDto } from '#dto/post/post-query.dto';
import { PostResponseDto } from '#dto/post/post-response.dto';
import { UpdatePostDto } from '#dto/post/update-post.dto';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
    ApiAcceptedResponse,
    ApiConsumes,
    ApiNotFoundResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FormDataRequest } from 'nestjs-form-data';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/guards/auth.guard';
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
    @FormDataRequest()
    @ApiConsumes('multipart/form-data')
    @ApiAcceptedResponse({ type: PostResponseDto })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiNotFoundResponse({ description: 'Post not found' })
    @Patch(':postId')
    async update(
        @Param('postId') postId: string,
        @Body() updatePostDto: UpdatePostDto,
        @Auth() user: AuthUser
    ) {
        const imageFile = updatePostDto.imageFile;
        const command = new UpdatePostCommand();
        command.id = postId;
        command.currentUserId = user.sub;
        command.title = updatePostDto.title;
        command.content = updatePostDto.content;
        command.status = updatePostDto.status;
        command.imageFile = imageFile
            ? {
                  buffer: imageFile.buffer,
                  name: imageFile.originalName,
                  contentType: imageFile.mimetype,
              }
            : undefined;
        const post = await this.commandBus.execute(command);
        return PostMapper.toDto(post);
    }

    @UseGuards(JwtAuthGuard)
    @ApiAcceptedResponse({ description: 'Post deleted' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiNotFoundResponse({ description: 'Post not found' })
    @Delete(':postId')
    delete(@Param('postId') postId: string, @Auth() user: AuthUser) {
        return this.commandBus.execute(new DeletePostCommand(postId, user.sub));
    }

    @Get(':postId')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiAcceptedResponse({ description: 'Post deleted' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiNotFoundResponse({ description: 'Post not found' })
    async getPost(@Param() param: PostParamDto, @Auth() user: AuthUser | null) {
        const post = await this.queryBus.execute(
            new GetPostQuery(param.postId, user?.sub ? 'ALL' : 'PUBLISHED')
        );
        return PostMapper.toDto(post);
    }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiAcceptedResponse({ description: 'Post deleted' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiNotFoundResponse({ description: 'Post not found' })
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
