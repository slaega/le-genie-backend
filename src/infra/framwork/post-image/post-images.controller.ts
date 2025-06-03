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
import { UploadImageCommand } from '#applications/commands/post-images/upload-image.command';
import { RemoveImageCommand } from '#applications/commands/post-images/remove-image.command';

@Controller('post/:postId/images')
export class PostImagesController {
    constructor(private readonly commandBus: CommandBus) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    uploadImage(
        @Param() postId: string,
        @Body() body: { file: File },
        @Auth() user: AuthUser
    ) {
        return this.commandBus.execute(
            new UploadImageCommand(postId, body.file)
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':invitationId/refuse')
    refuse(@Param() postId: string, @Auth() user: AuthUser) {
        return this.commandBus.execute(new RemoveImageCommand(postId, user.id));
    }
}
