import { AuthProvider } from '#domain/entities/auth-provider.entity';

export interface AuthProviderRepository {
    linkAuthProviderToUser(authProvider: AuthProvider): Promise<void>;

    unlinkAuthProviderFromUser(authProvider: AuthProvider): Promise<void>;
}
