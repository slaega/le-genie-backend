import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostCommand } from '#applications/commands/post/update-post.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
    constructor(
        @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository
    ) {}

    async execute(command: UpdatePostCommand) {
        const post = await this.postRepository.getPostById(command.id);
        if (!post) {
            throw new NotFoundException({
                message: 'Post non  Found',
            });
        }
        post.title = command.title ?? post.title;
        post.content = command.content ?? post.content;
        return this.postRepository.updatePost(post.id, post);
    }
}
