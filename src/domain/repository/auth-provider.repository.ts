import { AuthProvider, SocialProvider } from "#domain/entities/auth-provider.entity";

export interface AuthProviderRepository {
    linkProvider(params: {
      userId: string;
      provider: SocialProvider;
      providerUserId: string;
    }): Promise<void>;
  
    unlinkProvider(params: {
      userId: string;
      provider: SocialProvider;
    }): Promise<void>;
  
    findProvidersByUser(userId: string): Promise<AuthProvider[]>;
  }
  