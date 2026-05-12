import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostCommand } from '#applications/commands/post/update-post.command';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import {
    POST_REPOSITORY,
    STORAGE_PROVIDER,
} from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';
import { StorageProvider } from '#domain/services/storage.provider';
import { computeReadingTime } from '#shared/utils/reading-time';
import { slugify } from '#shared/utils/slugify';

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
        const newTitle = command.title ?? post.title;
        post.title = newTitle;
        post.content = command.content ?? post.content;
        post.readingTime = computeReadingTime(post.content);

        // Generate slug once from title (never overwrite an existing slug)
        if (!post.slug && newTitle && newTitle.trim()) {
            const base = slugify(newTitle);
            if (base) {
                let candidate = base;
                let counter = 2;
                while (await this.postRepository.isSlugTaken(candidate, post.id)) {
                    candidate = `${base}-${counter++}`;
                }
                post.slug = candidate;
            }
        }

        const wasPublished = post.status === 'PUBLISHED';
        post.status = command.status ?? post.status;

        // Transition to PUBLISHED: set publishedAt + clear any pending schedule
        if (!wasPublished && post.status === 'PUBLISHED') {
            if (!post.publishedAt) post.publishedAt = new Date();
            post.scheduledAt = null; // auto-clear schedule on publish
        } else {
            // scheduledAt: undefined = not touched, null = clear, Date = set
            if (command.scheduledAt !== undefined) {
                post.scheduledAt = command.scheduledAt;
            }
        }
        const updatedPost = await this.postRepository.updatePost(post.id, post);
        updatedPost.imagePath = await this.storageProvider.getPublicUrl(
            updatedPost.imagePath
        );
        return updatedPost;
    }
}
