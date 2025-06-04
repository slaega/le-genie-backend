import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { CreatePostTagsCommand } from '#applications/commands/post-tags/create-post-tags.command';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
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
            throw new NotFoundException({
                message: 'Post  non  Found',
            });
        }

        const contributor = post.contributors.find(
            (contributor) => contributor.userId === command.authId
        );
        if (!contributor) {
            throw new ForbiddenException({
                message: 'Forbidden your not authorized',
            });
        }
        return this.postTagRepository.removePostTags(
            command.postId,
            command.name
        );
    }
}
