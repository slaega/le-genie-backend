import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPostQuery } from '#applications/query/post/get-post.query';
import { PostRepository } from '#domain/repository/post.repository';
import {
    POST_REPOSITORY,
    STORAGE_PROVIDER,
} from '#shared/constantes/inject-token';
import { Inject, NotFoundException } from '@nestjs/common';
import { StorageProvider } from '#domain/services/storage.provider';
@QueryHandler(GetPostQuery)
export class GetPostQueryHandler implements IQueryHandler<GetPostQuery> {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository,
        @Inject(STORAGE_PROVIDER)
        private readonly storageProvider: StorageProvider
    ) {}

    async execute(query: GetPostQuery) {
        const post = await this.postRepository.getPostByIdAndStatus(
            query.postId,
            query.status
        );
        if (!post) {
            throw new NotFoundException({ error: 'Post not found' });
        }
        if (post.imagePath) {
            post.imagePath = await this.storageProvider.getPublicUrl(
                post.imagePath
            );
        }
        return post;
    }
}
