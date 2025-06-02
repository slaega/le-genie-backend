import { Entity } from "#core/entity";

export enum SocialProvider {
    GITHUB='GITHUB',
    GOOGLE='GOOGLE'
}

export class AuthProvider extends Entity {
  constructor(
    public  provider: SocialProvider,
    public  providerUserId: string,
    public  userId: string,
  ) {
    super();
  }
}


