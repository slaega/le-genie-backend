import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePostStatusCommand } from '#applications/commands/post/change-post-status.command';
import { ForbiddenException, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';

@CommandHandler(ChangePostStatusCommand)
export class ChangePostStatusHandler
    implements ICommandHandler<ChangePostStatusCommand>
{
    constructor(
        @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository
    ) {}

    async execute(command: ChangePostStatusCommand) {
        const post = await this.postRepository.getPostById(command.postId);
        if (!post) {
            throw new NotFoundException({
                message: 'Post non  Found',
            });
        }
        const contributors = post.contributors.find(
            (item) => item.id == command.authId
        );
        if (!contributors) {
            throw new ForbiddenException({
                message: 'Forbidden your not authorized',
            });
        }
        post.status = command.status;
        return this.postRepository.updatePost(post.id, post);
    }
}
