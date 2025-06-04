import { CommandBus } from '@nestjs/cqrs';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import {
    Body,
    Controller,
    Delete,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CreatePostTagsCommand } from '#applications/commands/post-tags/create-post-tags.command';
import { RemovePostTagsCommand } from '#applications/commands/post-tags/remove-post-tags.command';

@Controller('post/:postId/post-tags')
export class PostTagsController {
    constructor(private readonly commandBus: CommandBus) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    createPostTags(
        @Param() postId: string,
        @Body() body: { name: string },
        @Auth() user: AuthUser
    ) {
        return this.commandBus.execute(
            new CreatePostTagsCommand(postId, body.name, user.sub)
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':postName')
    refuse(
        @Param() { postId, postName }: { postId: string; postName: string },
        @Auth() user: AuthUser
    ) {
        return this.commandBus.execute(
            new RemovePostTagsCommand(postId, postName, user.sub)
        );
    }
}
