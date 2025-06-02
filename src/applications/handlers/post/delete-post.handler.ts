import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletePostCommand } from '#applications/commands/post/delete-post.command';
import { PostRepository } from '#domain/repository/post.repository';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { Inject } from '@nestjs/common';

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  async execute(command: DeletePostCommand) {
    const post = await this.postRepository.getPostById(command.id);
    if (!post) {
      throw new Error('Post not found');
    }
    return this.postRepository.removePost(post.id);
  }
}
