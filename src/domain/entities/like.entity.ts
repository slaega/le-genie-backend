import { Entity } from '#core/entity';

export class Like extends Entity {
    public postId: string;
    public fingerprint: string;
    public ip?: string;
    public userAgent?: string;
    public userId?: string;
    constructor() {
        super();
    }
}
