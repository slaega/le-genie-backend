import { CreateEmptyPostCommand } from '#applications/commands/post/create-empty-post.command'
import { DeletePostCommand } from '#applications/commands/post/delete-post.command'
import { UpdatePostCommand } from '#applications/commands/post/update-post.command'
import { GetPostQuery } from '#applications/query/post/get-post.query'
import { GetPostsQuery } from '#applications/query/post/get-posts.query'
import { PostMapper } from '#domain/mappers/post/post.mapper'
import { PostParamDto } from '#dto/post/post-param.dto'
import { PostQueryDto } from '#dto/post/post-query.dto'
import { PostResponseDto } from '#dto/post/post-response.dto'
import { UpdatePostDto } from '#dto/post/update-post.dto'
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
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import {
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { FormDataRequest } from 'nestjs-form-data'
import { Auth } from '../auth/auth.decorator'
import { AuthUser } from '../auth/auth.type'
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/guards/auth.guard'

@ApiTags('posts')
@Controller('posts')
export class PostController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create an empty draft post' })
    @ApiOkResponse({ type: PostResponseDto })
    async create(@Auth() user: AuthUser): Promise<PostResponseDto> {
        const post = await this.commandBus.execute(new CreateEmptyPostCommand(user.sub))
        return PostMapper.toDto(post)
    }

    @Patch(':postId')
    @UseGuards(JwtAuthGuard)
    @FormDataRequest()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Update a post (content, title, status, cover image)' })
    @ApiOkResponse({ type: PostResponseDto })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async update(
        @Param('postId') postId: string,
        @Body() dto: UpdatePostDto,
        @Auth() user: AuthUser,
    ): Promise<PostResponseDto> {
        const command = new UpdatePostCommand()
        command.id = postId
        command.currentUserId = user.sub
        command.title = dto.title
        command.content = dto.content
        command.status = dto.status
        command.imageFile = dto.imageFile
            ? {
                  buffer: dto.imageFile.buffer,
                  name: dto.imageFile.originalName,
                  contentType: dto.imageFile.mimetype,
              }
            : undefined
        const post = await this.commandBus.execute(command)
        return PostMapper.toDto(post)
    }

    @Delete(':postId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete a post (owner only)' })
    @ApiUnauthorizedResponse()
    delete(@Param('postId') postId: string, @Auth() user: AuthUser) {
        return this.commandBus.execute(new DeletePostCommand(postId, user.sub))
    }

    @Get(':postId')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get a single post' })
    @ApiOkResponse({ type: PostResponseDto })
    async getPost(@Param() param: PostParamDto, @Auth() user: AuthUser | null) {
        const status = user?.sub ? 'ALL' : 'PUBLISHED'
        const post = await this.queryBus.execute(new GetPostQuery(param.postId, status))
        return PostMapper.toDto(post)
    }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'List posts (paginated)' })
    async getPosts(@Query() query: PostQueryDto, @Auth() user: AuthUser | null) {
        const page = parseInt(query.page ?? '1', 10)
        const limit = Math.min(parseInt(query.limit ?? '12', 10), 50)
        const authId = query.me === 'true' ? user?.sub : undefined

        const result = await this.queryBus.execute(
            new GetPostsQuery(
                page,
                limit,
                { tags: query.tags, status: query.status },
                query.sort ?? 'recent',
                authId,
            ),
        )
        return {
            items: result.items.map(PostMapper.toDto),
            total: result.total,
            page: result.page,
            limit: result.limit,
            hasNextPage: result.hasNextPage,
        }
    }
}
