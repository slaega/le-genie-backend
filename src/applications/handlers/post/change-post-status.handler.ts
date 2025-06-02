import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePostStatusCommand } from '#applications/commands/post/change-post-status.command';
import { Inject } from '@nestjs/common';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';

@CommandHandler(ChangePostStatusCommand)
export class ChangePostStatusHandler
  implements ICommandHandler<ChangePostStatusCommand>
{
  constructor(
    @Inject(POST_REPOSITORY) private readonly postRepository: PostRepository,
  ) {}

  async execute(command: ChangePostStatusCommand) {
    const post = await this.postRepository.findOne({
      id: command.postId,
    });
    if (!post) {
      throw new Error('Post not found');
    }
    post.status = command.status;
    return this.postRepository.updateOne(post.id, post);
  }
}
