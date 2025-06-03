import { Entity } from '#core/entity';

export class Contributor extends Entity {
    public postId: string;
    public userId: string;
    public owner: boolean;
    constructor() {
        super();
    }
}
