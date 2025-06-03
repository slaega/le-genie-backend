import { Post } from '#domain/entities/post.entity';
import { Query } from '@nestjs/cqrs';

export class GetPostQuery extends Query<Post> {
    constructor(public readonly postId: string) {
        super();
    }
}
