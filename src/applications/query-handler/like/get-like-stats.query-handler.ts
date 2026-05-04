import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLikeStatsQuery } from '#applications/query/like/get-like-stats.query';
import { LikeRepository } from '#domain/repository/like.repository';
import { LIKE_REPOSITORY } from '#shared/constantes/inject-token';
import { Inject } from '@nestjs/common';

@QueryHandler(GetLikeStatsQuery)
export class GetLikeStatsQueryHandler
    implements IQueryHandler<GetLikeStatsQuery>
{
    constructor(
        @Inject(LIKE_REPOSITORY)
        private readonly likeRepository: LikeRepository
    ) {}

    async execute(query: GetLikeStatsQuery) {
        return this.likeRepository.getStats(query.postId, query.fingerprint);
    }
}
