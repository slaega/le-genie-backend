import { Query } from '@nestjs/cqrs';
import { Post } from '#domain/entities/post.entity';

export class GetPostsQuery extends Query<{
    items: Post[];
    total: number;
    page: number;
    limit: number;
}> {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly filter: { tags?: string[] },
        public readonly sort: string
    ) {
        super();
    }
}
