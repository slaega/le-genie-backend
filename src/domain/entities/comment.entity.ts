import { Entity } from '#core/entity';
import { User } from './user.entity';

export class Comment extends Entity {
    public postId: string;
    public content: string;
    public refactorAt?: Date;
    public userId: string;
    public user: User;
    constructor() {
        super();
    }
}
