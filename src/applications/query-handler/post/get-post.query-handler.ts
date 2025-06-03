import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPostQuery } from '#applications/query/post/get-post.query';
import { PostRepository } from '#domain/repository/post.repository';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { Inject } from '@nestjs/common';
@QueryHandler(GetPostQuery)
export class GetPostQueryHandler implements IQueryHandler<GetPostQuery> {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository
    ) {}

    async execute(query: GetPostQuery) {
        return this.postRepository.getPostByIdAndStatus(
            query.postId,
            'PUBLISHED'
        );
    }
}
