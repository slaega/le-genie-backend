import { Comment } from '#domain/entities/comment.entity';
import { Query } from '@nestjs/cqrs';

export class GetCommentsQuery extends Query<Comment[]> {
    constructor(
        public readonly postId: string,
        public readonly page: number,
        public readonly limit: number
    ) {
        super();
    }
}
