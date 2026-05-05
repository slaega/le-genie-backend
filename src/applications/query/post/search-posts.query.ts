import { Query } from '@nestjs/cqrs';
import { Post } from '#domain/entities/post.entity';
import { Pagination } from '#shared/Pagination';

export class SearchPostsQuery extends Query<Pagination<Post>> {
    constructor(
        public readonly q: string,
        public readonly page: number,
        public readonly limit: number
    ) {
        super();
    }
}
