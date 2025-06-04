import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPostQuery } from '#applications/query/post/get-post.query';
import { PostRepository } from '#domain/repository/post.repository';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { Inject, NotFoundException } from '@nestjs/common';
@QueryHandler(GetPostQuery)
export class GetPostQueryHandler implements IQueryHandler<GetPostQuery> {
    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository
    ) {}

    async execute(query: GetPostQuery) {
        const post = await this.postRepository.getPostByIdAndStatus(
            query.postId,
            query.status
        );
        if (!post) {
            throw new NotFoundException({ error: 'Post not found' });
        }
        return post;
    }
}
