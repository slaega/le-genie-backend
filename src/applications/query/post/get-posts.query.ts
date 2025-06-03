import { Query } from '@nestjs/cqrs';
import { Post } from '#domain/entities/post.entity';

export class GetPostsQuery extends Query<Post[]> {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly filter: { tags?: string[] },
        public readonly sort: string,
        public readonly order: string
    ) {
        super();
    }
}
