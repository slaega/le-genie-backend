import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPostsQuery } from '#applications/query/post/get-posts.query';
import { PostRepository } from '#domain/repository/post.repository';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { Inject } from '@nestjs/common';
@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler implements IQueryHandler<GetPostsQuery> {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository
    ) {}

    async execute(query: GetPostsQuery) {
        return this.postRepository.getPosts(
            query.page,
            query.limit,
            query.filter,
            query.sort,
            query.order
        );
    }
}
