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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '../auth/auth.decorator';
import { UpdatePostCommand } from '#applications/commands/post/update-post.command';
import { DeletePostCommand } from '#applications/commands/post/delete-post.command';
import { AuthUser } from '../auth/auth.type';
import { UpdatePostDto } from '#dto/post/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PostParamDto } from '#dto/post/post-param.dto';
import { GetPostQuery } from '#applications/query/post/get-post.query';
import { GetPostsQuery } from '#applications/query/post/get-posts.query';
import { PostQueryDto } from '#dto/post/post-query.dto';

@Controller('posts')
export class PostController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Auth() user: AuthUser) {
        return this.commandBus.execute(new CreateEmptyPostCommand(user.id));
    }

    @UseGuards(JwtAuthGuard)
    @Put(':postId')
    update(
        @Param('postId') postId: string,
        @Body() updatePostDto: UpdatePostDto,
        @Auth() user: AuthUser
    ) {
        return this.commandBus.execute(
            new UpdatePostCommand(
                postId,
                user.id,
                updatePostDto.content,
                updatePostDto.title,
                updatePostDto.tags
            )
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':postId')
    delete(@Param('postId') postId: string, @Auth() user: AuthUser) {
        return this.commandBus.execute(new DeletePostCommand(postId, user.id));
    }

    @Get(':postId')
    getPost(@Param() param: PostParamDto) {
        return this.queryBus.execute(new GetPostQuery(param.postId));
    }

    @Get()
    getPosts(@Query() query: PostQueryDto) {
        return this.queryBus.execute(
            new GetPostsQuery(
                query.page,
                query.limit,
                query.filter,
                query.sort,
                query.order
            )
        );
    }
}
