import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UploadImageCommand } from '#applications/commands/post-images/upload-image.command';
import { StorageProvider } from '#domain/services/storage.provider';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import {
    POST_REPOSITORY,
    STORAGE_PROVIDER,
} from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';

@CommandHandler(UploadImageCommand)
export class UploadImageHandler implements ICommandHandler<UploadImageCommand> {
    constructor(
        @Inject(STORAGE_PROVIDER)
        private readonly storageProvider: StorageProvider,
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository
    ) {}

    async execute(command: UploadImageCommand): Promise<string> {
        const post = await this.postRepository.getPostById(command.postId);
        if (!post) {
            throw new NotFoundException({ message: 'Post not found' });
        }
        if (!post.contributors.find((item) => item.id === command.authId)) {
            throw new ForbiddenException({ message: 'Required authorization' });
        }
        const path = await this.storageProvider.upload({
            path: `${command.postId}/images/${command.image.name}`,
            file: command.image.buffer,
            contentType: command.image.contentType,
        });

        return await this.storageProvider.getPublicUrl(path);
    }
}
