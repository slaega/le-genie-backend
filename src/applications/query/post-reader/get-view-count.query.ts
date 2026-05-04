import { Query } from '@nestjs/cqrs';

export class GetViewCountQuery extends Query<{ count: number }> {
    constructor(public readonly postId: string) {
        super();
    }
}
