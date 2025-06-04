import { Entity } from '#core/entity';
import { AuthProvider } from './auth-provider.entity';

export class User extends Entity {
    public email: string;
    public name: string;
    public avatarPath?: string;
    public authProviders?: AuthProvider[];
    constructor() {
        super();
    }
}
