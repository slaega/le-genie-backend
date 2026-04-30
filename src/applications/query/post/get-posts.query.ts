import { Query } from '@nestjs/cqrs'
import { Post } from '#domain/entities/post.entity'
import { Pagination } from '#shared/Pagination'
import { PostStatus } from '#shared/enums/post-status.enum'

export class GetPostsQuery extends Query<Pagination<Post>> {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly filter: { tags?: string[]; status?: PostStatus },
        public readonly sort: string,
        public readonly authId?: string,
    ) {
        super()
    }
}
