import { Entity } from '#core/entity';

export const SocialProvider = {
  GITHUB: 'GITHUB',
  GOOGLE: 'GOOGLE',
} as const;

export type SocialProvider =
  (typeof SocialProvider)[keyof typeof SocialProvider];

export class AuthProvider extends Entity {
  public provider: SocialProvider;
  public providerUserId: string;
  public userId: string;
  constructor() {
    super();
  }
}
