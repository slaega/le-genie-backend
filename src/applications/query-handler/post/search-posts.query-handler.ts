import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { SearchPostsQuery } from '#applications/query/post/search-posts.query';
import { PostRepository } from '#domain/repository/post.repository';
import {
    POST_REPOSITORY,
    STORAGE_PROVIDER,
} from '#shared/constantes/inject-token';
import { Inject } from '@nestjs/common';
import { StorageProvider } from '#domain/services/storage.provider';

@QueryHandler(SearchPostsQuery)
export class SearchPostsQueryHandler
    implements IQueryHandler<SearchPostsQuery>
{
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository,
        @Inject(STORAGE_PROVIDER)
        private readonly storageProvider: StorageProvider
    ) {}

    async execute(query: SearchPostsQuery) {
        const data = await this.postRepository.searchPosts(
            query.q,
            query.page,
            query.limit
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
        return { ...data, items: posts };
    }
}
