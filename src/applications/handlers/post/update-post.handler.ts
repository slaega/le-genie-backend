import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostCommand } from '#applications/commands/post/update-post.command';
import { Inject } from '@nestjs/common';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';
import { PostTag } from '#domain/entities/post-tag.entity';

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
    constructor(
        @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository
    ) {}

    async execute(command: UpdatePostCommand) {
        const post = await this.postRepository.getPostById(command.id);
        if (!post) {
            throw new Error('Post not found');
        }
        post.title = command.title ?? post.title;
        post.content = command.content ?? post.content;
        post.postTags =
            command.tags?.map((tag) => {
                const postTag = new PostTag();
                postTag.name = tag;
                postTag.postId = post.id;
                return postTag;
            }) ?? post.postTags;
        return this.postRepository.updatePost(post.id, post);
    }
}
