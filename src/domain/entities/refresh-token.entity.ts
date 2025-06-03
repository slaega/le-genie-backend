import { Entity } from '#core/entity';

export class RefreshToken extends Entity {
    userId: string;
    token: string;
}
