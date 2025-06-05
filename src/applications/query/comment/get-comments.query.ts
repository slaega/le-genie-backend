import { Comment } from '#domain/entities/comment.entity';
import { Query } from '@nestjs/cqrs';
import { Pagination } from '#shared/Pagination';

export class GetCommentsQuery extends Query<Pagination<Comment>> {
    constructor(
        public readonly postId: string,
        public readonly page: number,
        public readonly limit: number
    ) {
        super();
    }
}
