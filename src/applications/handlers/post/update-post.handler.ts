import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostCommand } from '#applications/commands/post/update-post.command';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import {
    POST_REPOSITORY,
    STORAGE_PROVIDER,
} from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';
import { StorageProvider } from '#domain/services/storage.provider';

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository,
        @Inject(STORAGE_PROVIDER)
        private readonly storageProvider: StorageProvider
    ) {}

    async execute(command: UpdatePostCommand) {
        const post = await this.postRepository.getPostById(command.id);
        if (!post) {
            throw new NotFoundException({
                message: 'Post non  Found',
            });
        }

        if (
            !post.contributors.find((c) => c.userId === command.currentUserId)
        ) {
            throw new ForbiddenException({
                message: 'Forbidden your not authorized',
            });
        }

        if (command.imageFile) {
            if (post.imagePath) {
                await this.storageProvider.delete(post.imagePath);
            }
            post.imagePath = await this.storageProvider.upload({
                path: `post/${command.id}/${command.imageFile.name}`,
                file: command.imageFile.buffer,
                contentType: command.imageFile.contentType,
            });
        }
        post.title = command.title ?? post.title;
        post.content = command.content ?? post.content;
        post.status = command.status ?? post.status;
        const updatedPost = await this.postRepository.updatePost(post.id, post);
        updatedPost.imagePath = await this.storageProvider.getPublicUrl(
            updatedPost.imagePath
        );
        return updatedPost;
    }
}
