import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPostsQuery } from '#applications/query/post/get-posts.query';
import { PostRepository } from '#domain/repository/post.repository';
import {
    POST_REPOSITORY,
    STORAGE_PROVIDER,
} from '#shared/constantes/inject-token';
import { Inject } from '@nestjs/common';
import { StorageProvider } from '#domain/services/storage.provider';
@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler implements IQueryHandler<GetPostsQuery> {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository,
        @Inject(STORAGE_PROVIDER)
        private readonly storageProvider: StorageProvider
    ) {}

    async execute(query: GetPostsQuery) {
        const data = await this.postRepository.getPosts(
            query.page,
            query.limit,
            query.filter,
            query.sort,
            query.authId
        );
        const posts = await Promise.all(
            data.items.map(async (post) => {
                if (post.imagePath) {
                    post.imagePath = await this.storageProvider.getPublicUrl(
                        post.imagePath
                    );
                }
                return post;
            })
        );
        return {
            ...data,
            items: posts,
        };
    }
}
