import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
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
import { MakeCommentCommand } from '#applications/commands/comment/make-comment.command';
import { RefactorCommentCommand } from '#applications/commands/comment/refactor-comment.command';
import { RemoveCommentCommand } from '#applications/commands/comment/remove-comment.command';
import { CommentParamDto } from '#dto/comment/comment-param.dto';
import { CreateCommentDto } from '#dto/comment/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PostParamDto } from '#dto/post/post-param.dto';
import { GetCommentsQuery } from '#applications/query/comment/get-comments.query';
import { CommentQueryDto } from '#dto/comment/post-query.dto';

@Controller('posts/:postId/comments/')
export class CommentController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    create(
        @Param() param: PostParamDto,
        @Body() createCommentDto: CreateCommentDto,
        @Auth() user: AuthUser
    ) {
        return this.commandBus.execute(
            new MakeCommentCommand(
                param.postId,
                createCommentDto.content,
                user.sub
            )
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':commentId')
    delete(@Param() param: CommentParamDto, @Auth() user: AuthUser) {
        return this.commandBus.execute(
            new RemoveCommentCommand(param.postId, param.commentId, user.sub)
        );
    }

    @Get()
    getComment(@Param() param: PostParamDto, @Query() query: CommentQueryDto) {
        const page = parseInt(query.page ?? '1', 10);
        const limit = parseInt(query.limit ?? '10', 10);
        return this.queryBus.execute(
            new GetCommentsQuery(param.postId, page, limit)
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':commentId')
    update(
        @Param() param: CommentParamDto,
        @Body() createCommentDto: CreateCommentDto,
        @Auth() auth: AuthUser
    ) {
        return this.commandBus.execute(
            new RefactorCommentCommand(
                param.postId,
                param.commentId,
                createCommentDto.content,
                auth.sub
            )
        );
    }
}
