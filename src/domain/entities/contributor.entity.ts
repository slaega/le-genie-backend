import { Entity } from '#core/entity';
import { User } from '#domain/entities/user.entity';

export class Contributor extends Entity {
    public postId: string;
    public userId: string;
    public owner: boolean;
    public user: User;
    constructor() {
        super();
    }
}
