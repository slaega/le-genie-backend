import { CreateEmptyPostCommand } from '#applications/commands/post/create-empty-post.command';
import {
    Controller,
    Post,
    Body,
    Delete,
    Put,
    Param,
    UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Auth } from '../auth/auth.decorator';
import { UpdatePostCommand } from '#applications/commands/post/update-post.command';
import { DeletePostCommand } from '#applications/commands/post/delete-post.command';
import { AuthUser } from '../auth/auth.type';
import { UpdatePostDto } from '#dto/post/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('posts')
export class PostController {
    constructor(private readonly commandBus: CommandBus) {}
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
}
