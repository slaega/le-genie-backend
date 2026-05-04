import { Entity } from '#core/entity';

export class PostReader extends Entity {
    public postId: string;
    public readerId: string;
    public ip?: string;
    public userAgent?: string;
    public userId?: string;
    public viewedAt: Date;
    constructor() {
        super();
    }
}
