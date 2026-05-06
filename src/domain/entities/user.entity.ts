import { Entity } from '#core/entity';
import { AuthProvider } from './auth-provider.entity';

export type UserRole = 'USER' | 'ADMIN';

export class User extends Entity {
    public email: string;
    public name: string;
    public avatarPath?: string;
    public role?: UserRole;
    public suspended?: boolean;
    public authProviders?: AuthProvider[];
    constructor() {
        super();
    }
}
