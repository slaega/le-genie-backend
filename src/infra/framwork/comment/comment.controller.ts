import { CommandBus } from '@nestjs/cqrs';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MakeCommentCommand } from '#applications/commands/comment/make-comment.command';
import { RefactorCommentCommand } from '#applications/commands/comment/refactor-comment.command';
import { RemoveCommentCommand } from '#applications/commands/comment/remove-comment.command';
import { CommentParamDto } from '#dto/comment/comment-param.dto';
import { CreateCommentDto } from '#dto/comment/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('post/:postId/comments/')
export class CommentController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param() param: CommentParamDto,
    @Body() createCommentDto: CreateCommentDto,
    @Auth() user: AuthUser,
  ) {
    return this.commandBus.execute(
      new MakeCommentCommand(param.postId, createCommentDto.content, user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  delete(@Param() param: CommentParamDto, @Auth() user: AuthUser) {
    return this.commandBus.execute(
      new RemoveCommentCommand(param.postId, param.commentId, user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':commentId')
  update(
    @Param() param: CommentParamDto,
    @Body() createCommentDto: CreateCommentDto,
    @Auth() auth: AuthUser,
  ) {
    return this.commandBus.execute(
      new RefactorCommentCommand(
        param.postId,
        param.commentId,
        createCommentDto.content,
        auth.id,
      ),
    );
  }
}
