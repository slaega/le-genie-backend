import { LikeStats } from '#domain/repository/like.repository';
import { Query } from '@nestjs/cqrs';

export class GetLikeStatsQuery extends Query<LikeStats> {
    constructor(
        public readonly postId: string,
        public readonly fingerprint: string
    ) {
        super();
    }
}
