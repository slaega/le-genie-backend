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
import { CreatePostImageDto } from '#dto/post-images/create-post-image.dto';
import { FormDataRequest } from 'nestjs-form-data';

@Controller('posts/:postId/images')
export class PostImagesController {
    constructor(private readonly commandBus: CommandBus) {}

    @UseGuards(JwtAuthGuard)
    @FormDataRequest()
    @Post()
    uploadImage(
        @Param('postId') postId: string,
        @Body() createPostImage: CreatePostImageDto,
        @Auth() auth: AuthUser
    ) {
        const imageFile = {
            buffer: createPostImage.imageFile.buffer,
            name: createPostImage.imageFile.originalName,
            contentType: createPostImage.imageFile.mimetype,
        };
        return this.commandBus.execute(
            new UploadImageCommand(postId, auth.sub, imageFile)
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':url')
    refuse(@Param() postId: string, @Auth() user: AuthUser) {
        return this.commandBus.execute(
            new RemoveImageCommand(postId, user.sub)
        );
    }
}
