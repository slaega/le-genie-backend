import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { CreatePostTagsCommand } from '#applications/commands/post-tags/create-post-tags.command';
import { Inject } from '@nestjs/common';
import {
    CONTRIBUTOR_REPOSITORY,
    POST_REPOSITORY,
    POST_TAGS_REPOSITORY,
} from '#shared/constantes/inject-token';
import { PostTagsRepository } from '#domain/repository/post-tags.repository';
import { PostRepository } from '#domain/repository/post.repository';
import { ContributorRepository } from '#domain/repository/contributor.repository';
@CommandHandler(CreatePostTagsCommand)
export class CreatePostTagsHandler
    implements ICommandHandler<CreatePostTagsCommand>
{
    constructor(
        @Inject(POST_TAGS_REPOSITORY)
        private postTagRepository: PostTagsRepository,
        @Inject(CONTRIBUTOR_REPOSITORY)
        private contributorRepository: ContributorRepository,
        @Inject(POST_REPOSITORY)
        private postRepository: PostRepository
    ) {}

    async execute(command: CreatePostTagsCommand): Promise<void> {
        const post = await this.postRepository.getPostById(command.postId);
        if (!post) {
            throw new Error('Post not found');
        }
        const contributors =
            await this.contributorRepository.getContributorsByPostId(
                command.postId
            );
        if (!contributors.length) {
            throw new Error('Contributor not found');
        }
        const contributor = contributors.find(
            (contributor) => contributor.userId === command.authId
        );
        if (!contributor) {
            throw new Error('Contributor not found');
        }
        return this.postTagRepository.removePostTags(
            command.postId,
            command.name
        );
    }
}
