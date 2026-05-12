import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AuthConfig } from './auth-config.type';
import validateConfig from '#shared/utils/validate-config';

class EnvironmentVariablesValidator {
    @IsString()
    @IsNotEmpty()
    AUTH_ACCESS_TOKEN_JWT_SECRET: string;

    @IsString()
    @IsNotEmpty()
    AUTH_ACCESS_TOKEN_JWT_EXPIRES_IN: string;

    @IsString()
    @IsNotEmpty()
    AUTH_REFRESH_TOKEN_JWT_SECRET: string;

    @IsString()
    @IsNotEmpty()
    AUTH_REFRESH_TOKEN_JWT_EXPIRES_IN: string;

    // OAuth providers — all optional (NestJS starts even if not configured)

    @IsOptional()
    @IsString()
    AUTH_GOOGLE_CLIENT_ID?: string;

    @IsOptional()
    @IsString()
    AUTH_GOOGLE_CLIENT_SECRET?: string;

    @IsOptional()
    @IsString()
    AUTH_GITHUB_CLIENT_ID?: string;

    @IsOptional()
    @IsString()
    AUTH_GITHUB_CLIENT_SECRET?: string;

    @IsOptional()
    @IsString()
    AUTH_MICROSOFT_CLIENT_ID?: string;

    @IsOptional()
    @IsString()
    AUTH_MICROSOFT_CLIENT_SECRET?: string;
}

export default registerAs<AuthConfig>('auth', () => {
    const validatedConfig = validateConfig(
        process.env,
        EnvironmentVariablesValidator
    );

    const googleConfigured =
        validatedConfig.AUTH_GOOGLE_CLIENT_ID &&
        validatedConfig.AUTH_GOOGLE_CLIENT_SECRET;
    const githubConfigured =
        validatedConfig.AUTH_GITHUB_CLIENT_ID &&
        validatedConfig.AUTH_GITHUB_CLIENT_SECRET;
    const microsoftConfigured =
        validatedConfig.AUTH_MICROSOFT_CLIENT_ID &&
        validatedConfig.AUTH_MICROSOFT_CLIENT_SECRET;

    return {
        accessTokenJwtSecret: validatedConfig.AUTH_ACCESS_TOKEN_JWT_SECRET,
        accessTokenJwtExpiresIn:
            validatedConfig.AUTH_ACCESS_TOKEN_JWT_EXPIRES_IN,
        refreshTokenJwtSecret: validatedConfig.AUTH_REFRESH_TOKEN_JWT_SECRET,
        refreshTokenJwtExpiresIn:
            validatedConfig.AUTH_REFRESH_TOKEN_JWT_EXPIRES_IN,
        google: googleConfigured
            ? {
                  clientID: validatedConfig.AUTH_GOOGLE_CLIENT_ID!,
                  clientSecret: validatedConfig.AUTH_GOOGLE_CLIENT_SECRET!,
              }
            : undefined,
        github: githubConfigured
            ? {
                  clientID: validatedConfig.AUTH_GITHUB_CLIENT_ID!,
                  clientSecret: validatedConfig.AUTH_GITHUB_CLIENT_SECRET!,
              }
            : undefined,
        microsoft: microsoftConfigured
            ? {
                  clientID: validatedConfig.AUTH_MICROSOFT_CLIENT_ID!,
                  clientSecret: validatedConfig.AUTH_MICROSOFT_CLIENT_SECRET!,
              }
            : undefined,
    };
});
