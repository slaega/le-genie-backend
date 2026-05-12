export type OAuthProviderConfig = {
    clientID: string;
    clientSecret: string;
};

export type AuthConfig = {
    accessTokenJwtSecret: string;
    accessTokenJwtExpiresIn: string;
    refreshTokenJwtSecret: string;
    refreshTokenJwtExpiresIn: string;
    google?: OAuthProviderConfig;
    github?: OAuthProviderConfig;
    microsoft?: OAuthProviderConfig;
};
