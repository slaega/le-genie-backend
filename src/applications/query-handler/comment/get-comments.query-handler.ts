import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCommentsQuery } from '#applications/query/comment/get-comments.query';
import { CommentRepository } from '#domain/repository/comment.repository';
import { COMMENT_REPOSITORY } from '#shared/constantes/inject-token';
import { Inject } from '@nestjs/common';
@QueryHandler(GetCommentsQuery)
export class GetCommentsQueryHandler
    implements IQueryHandler<GetCommentsQuery>
{
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: CommentRepository
    ) {}

    async execute(query: GetCommentsQuery) {
        return this.commentRepository.getCommentsByPostId(
            query.postId,
            query.page,
            query.limit
        );
    }
}
