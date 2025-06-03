import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';

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

    @IsString()
    @IsNotEmpty()
    AUTH_GOOGLE_CLIENT_ID: string;

    @IsString()
    @IsNotEmpty()
    AUTH_GOOGLE_CLIENT_SECRET: string;

    @IsString()
    @IsNotEmpty()
    AUTH_GOOGLE_CLIENT_CALL_BACK_URL: string;

    @IsString()
    @IsNotEmpty()
    AUTH_GITHUB_CLIENT_ID: string;

    @IsString()
    @IsNotEmpty()
    AUTH_GITHUB_CLIENT_SECRET: string;

    @IsString()
    @IsNotEmpty()
    AUTH_GITHUB_CLIENT_CALL_BACK_URL: string;
}

export default registerAs<AuthConfig>('auth', () => {
    const validatedConfig = validateConfig(
        process.env,
        EnvironmentVariablesValidator
    );

    return {
        accessTokenJwtSecret: validatedConfig.AUTH_ACCESS_TOKEN_JWT_SECRET,
        accessTokenJwtExpiresIn:
            validatedConfig.AUTH_ACCESS_TOKEN_JWT_EXPIRES_IN,
        refreshTokenJwtSecret: validatedConfig.AUTH_REFRESH_TOKEN_JWT_SECRET,
        refreshTokenJwtExpiresIn:
            validatedConfig.AUTH_REFRESH_TOKEN_JWT_EXPIRES_IN,
        google: {
            clientID: validatedConfig.AUTH_GOOGLE_CLIENT_ID,
            clientSecret: validatedConfig.AUTH_GOOGLE_CLIENT_SECRET,
            callbackURL: validatedConfig.AUTH_GOOGLE_CLIENT_CALL_BACK_URL,
        },
        github: {
            clientID: validatedConfig.AUTH_GITHUB_CLIENT_ID,
            clientSecret: validatedConfig.AUTH_GITHUB_CLIENT_SECRET,
            callbackURL: validatedConfig.AUTH_GITHUB_CLIENT_CALL_BACK_URL,
        },
    };
});
