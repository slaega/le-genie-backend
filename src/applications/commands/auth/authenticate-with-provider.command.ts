import { SocialProvider } from '#domain/entities/auth-provider.entity';

export class AuthenticateWithProviderCommand {
  constructor(
    public readonly provider: SocialProvider,
    public readonly providerUserId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly avatarUrl?: string,
  ) {}
}
