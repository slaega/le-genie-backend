import { registerAs } from '@nestjs/config';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    Min,
} from 'class-validator';

import validateConfig from '#shared/utils/validate-config';
import { AppConfig } from './app-config.type';

export enum Environment {
    Development = 'development',
    Production = 'production',
    Staging = 'staging',
}

class EnvironmentVariablesValidator {
    @IsString()
    @IsOptional()
    PWD?: string;

    @IsEnum(Environment)
    @IsOptional()
    NODE_ENV: Environment;

    @IsInt()
    @Min(0)
    @Max(65535)
    @IsOptional()
    APP_PORT?: number;

    @IsInt()
    @Min(0)
    @Max(65535)
    @IsOptional()
    PORT?: number;

    @IsString()
    @IsOptional()
    APP_NAME?: string;

    @IsUrl({ require_tld: false })
    @IsOptional()
    FRONTEND_DOMAIN?: string;

    @IsUrl({ require_tld: false })
    @IsOptional()
    BACKEND_DOMAIN?: string;

    @IsString()
    @IsOptional()
    API_PREFIX?: string;

    @IsString()
    @IsOptional()
    APP_FALLBACK_LANGUAGE?: string;

    @IsString()
    @IsOptional()
    APP_HEADER_LANGUAGE?: string;

    @IsInt()
    APP_THROTTLER_TTL: number;

    @IsInt()
    APP_THROTTLER_LIMIT: number;

    @IsString()
    @IsNotEmpty()
    COOKIE_SECRET: string;

    @IsString()
    @IsOptional()
    APP_REDIS_HOST?: string;

    @IsInt()
    @IsOptional()
    APP_REDIS_PORT?: number;

    @IsString()
    @IsOptional()
    APP_REDIS_USERNAME?: string;

    @IsString()
    @IsOptional()
    APP_REDIS_PASSWORD?: string;
}

export default registerAs<AppConfig>('app', () => {
    const validatedConfig = validateConfig(
        process.env,
        EnvironmentVariablesValidator
    );
    return {
        nodeEnv: validatedConfig.NODE_ENV,
        name: validatedConfig.APP_NAME || 'Akieni Blog',
        workingDirectory: validatedConfig.PWD || process.cwd(),
        frontendDomain: validatedConfig.FRONTEND_DOMAIN,
        backendDomain: validatedConfig.BACKEND_DOMAIN ?? 'http://localhost',
        port: validatedConfig.APP_PORT
            ? validatedConfig.APP_PORT
            : validatedConfig.PORT
              ? validatedConfig.PORT
              : 3000,
        emailValidationEnabled: true,
        apiPrefix: validatedConfig.API_PREFIX || 'api',
        fallbackLanguage: validatedConfig.APP_FALLBACK_LANGUAGE || 'en',
        headerLanguage: validatedConfig.APP_HEADER_LANGUAGE || 'x-custom-lang',
        throttlerTtl: validatedConfig.APP_THROTTLER_TTL || 1000,
        throttlerLimit: validatedConfig.APP_THROTTLER_LIMIT || 50,
        cookieSecret: validatedConfig.COOKIE_SECRET,
        redis: {
            host: validatedConfig.APP_REDIS_HOST,
            port: validatedConfig.APP_REDIS_PORT,
            username: validatedConfig.APP_REDIS_USERNAME,
            password: validatedConfig.APP_REDIS_PASSWORD,
        },
    };
});
