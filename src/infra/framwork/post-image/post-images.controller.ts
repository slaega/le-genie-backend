import { CommandBus } from '@nestjs/cqrs';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UploadImageCommand } from '#applications/commands/post-images/upload-image.command';

import { CreatePostImageDto } from '#dto/post-images/create-post-image.dto';
import { FormDataRequest } from 'nestjs-form-data';
import { ApiConsumes } from '@nestjs/swagger';

@Controller('posts/:postId/images')
export class PostImagesController {
    constructor(private readonly commandBus: CommandBus) {}

    @UseGuards(JwtAuthGuard)
    @FormDataRequest()
    @Post()
    @ApiConsumes('multipart/form-data')
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
}
