import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEmptyPostCommand } from '#applications/commands/post/create-empty-post.command';
import { Inject } from '@nestjs/common';
import {
    CONTRIBUTOR_REPOSITORY,
    POST_REPOSITORY,
} from '#shared/constantes/inject-token';
import { PostRepository } from '#domain/repository/post.repository';
import { Post } from '#domain/entities/post.entity';
import { Contributor } from '#domain/entities/contributor.entity';
import { ContributorRepository } from '#domain/repository/contributor.repository';

@CommandHandler(CreateEmptyPostCommand)
export class CreateEmptyPostHandler
    implements ICommandHandler<CreateEmptyPostCommand>
{
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository,
        @Inject(CONTRIBUTOR_REPOSITORY)
        private readonly contributorRepository: ContributorRepository
    ) {}

    async execute(command: CreateEmptyPostCommand) {
        const post = new Post();
        post.createEmptyPost(command.userId);
        const contributor = new Contributor();
        contributor.postId = post.id;
        contributor.userId = command.userId;
        contributor.owner = true;
        await this.contributorRepository.createContributor(contributor);
        return this.postRepository.createPost(post);
    }
}
