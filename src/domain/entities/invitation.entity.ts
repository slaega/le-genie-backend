import { Entity } from '#core/entity';

export class Invitation extends Entity {
    public postId: string;
    public content?: string | null;
    public email: string;
    public token: string;
    public expiredAt: Date;
    constructor() {
        super();
    }
}
