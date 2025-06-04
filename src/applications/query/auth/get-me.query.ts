import { Query } from '@nestjs/cqrs';
import { User } from '#domain/entities/user.entity';

export class GetMeQuery extends Query<User> {
    constructor(public readonly userId: string) {
        super();
    }
}
