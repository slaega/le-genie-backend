import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetViewCountQuery } from '#applications/query/post-reader/get-view-count.query';
import { PostReaderRepository } from '#domain/repository/post-reader.repository';
import { POST_READER_REPOSITORY } from '#shared/constantes/inject-token';
import { Inject } from '@nestjs/common';

@QueryHandler(GetViewCountQuery)
export class GetViewCountQueryHandler
    implements IQueryHandler<GetViewCountQuery>
{
    constructor(
        @Inject(POST_READER_REPOSITORY)
        private readonly readerRepository: PostReaderRepository
    ) {}

    async execute(query: GetViewCountQuery) {
        const count = await this.readerRepository.countByPost(query.postId);
        return { count };
    }
}
