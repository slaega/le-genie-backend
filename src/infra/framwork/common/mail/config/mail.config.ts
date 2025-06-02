import { registerAs } from '@nestjs/config';

import {
    IsString,
    IsInt,
    Min,
    Max,
    IsOptional,
    IsBoolean,
    IsEmail,
    ValidateIf,
} from 'class-validator';
import validateConfig from '#shared/utils/validate-config';
import { MailConfig } from './mail-config.type';

class EnvironmentVariablesValidator {
    @ValidateIf((envValues) => envValues.API_KEY_SENDGRID)
    @IsInt()
    @Min(0)
    @Max(65535)
    @IsOptional()
    MAIL_PORT: number;

    @ValidateIf((envValues) => envValues.API_KEY_SENDGRID)
    @IsString()
    MAIL_HOST: string;

    @ValidateIf((envValues) => envValues.API_KEY_SENDGRID)
    @IsString()
    @IsOptional()
    MAIL_USER: string;

    @ValidateIf((envValues) => envValues.API_KEY_SENDGRID)
    @IsString()
    @IsOptional()
    MAIL_PASSWORD: string;

    @ValidateIf((envValues) => envValues.API_KEY_SENDGRID)
    @IsEmail()
    MAIL_DEFAULT_EMAIL: string;

    @ValidateIf((envValues) => envValues.API_KEY_SENDGRID)
    @IsString()
    MAIL_DEFAULT_NAME: string;

    @ValidateIf((envValues) => envValues.API_KEY_SENDGRID)
    @IsBoolean()
    MAIL_IGNORE_TLS: boolean;

    @ValidateIf((envValues) => envValues.API_KEY_SENDGRID)
    @IsBoolean()
    MAIL_SECURE: boolean;

    @ValidateIf((envValues) => envValues.API_KEY_SENDGRID)
    @IsBoolean()
    MAIL_REQUIRE_TLS: boolean;

    @IsOptional()
    @IsString()
    API_KEY_SENDGRID: string;
}

export default registerAs<MailConfig>('mail', () => {
    const config = validateConfig(process.env, EnvironmentVariablesValidator);

    return {
        port: config.MAIL_PORT ? parseInt(config.MAIL_PORT, 10) : 587,
        host: config.MAIL_HOST,
        user: config.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        defaultEmail: process.env.MAIL_DEFAULT_EMAIL,
        defaultName: process.env.MAIL_DEFAULT_NAME,
        ignoreTLS: process.env.MAIL_IGNORE_TLS === 'true',
        secure: process.env.MAIL_SECURE === 'true',
        requireTLS: process.env.MAIL_REQUIRE_TLS === 'true',
        apikeySendgrid: process.env.API_KEY_SENDGRID,
    };
});
