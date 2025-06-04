import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEmptyPostCommand } from '#applications/commands/post/create-empty-post.command';
import { Inject } from '@nestjs/common';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';
import { Post } from '#domain/entities/post.entity';
import { Contributor } from '#domain/entities/contributor.entity';

@CommandHandler(CreateEmptyPostCommand)
export class CreateEmptyPostHandler
    implements ICommandHandler<CreateEmptyPostCommand>
{
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository
    ) {}

    async execute(command: CreateEmptyPostCommand) {
        const post = new Post();
        post.createEmptyPost(command.userId);
        const contributor = new Contributor();
        contributor.postId = post.id;
        contributor.userId = command.userId;
        contributor.owner = true;
        return this.postRepository.createPost(post);
    }
}
