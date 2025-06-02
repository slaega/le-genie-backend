
import { Entity } from '#core/entity';
import { AuthProvider } from './auth-provider.entity';

export class User extends Entity {
  constructor(
    public  email: string,
    public  name: string,
    public  avatarUrl?: string,
    public  authProviders?: AuthProvider[],
  ) {
    super();
  }
}
