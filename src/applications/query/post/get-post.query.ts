import { Post } from '#domain/entities/post.entity';
import { PostStatus } from '#shared/enums/post-status.enum';
import { Query } from '@nestjs/cqrs';

export class GetPostQuery extends Query<Post> {
    constructor(
        public readonly postId: string,
        public readonly status: PostStatus | 'ALL'
    ) {
        super();
    }
}
