import { registerAs } from '@nestjs/config';
import { IsString, IsUrl, MinLength } from 'class-validator';
import { StorageConfig } from './storage-config.type';
import validateConfig from '#shared/utils/validate-config';

class EnvironmentVariablesValidator {
    @IsString()
    @MinLength(8)
    STORAGE_ACCESS_ID: string;

    @IsString()
    @MinLength(8)
    STORAGE_ACCESS_KEY: string;

    @IsUrl({ require_tld: false })
    @IsString()
    STORAGE_ENDPOINT: string;

    @IsString()
    STORAGE_BUCKET: string;
}

export default registerAs<StorageConfig>('storage', () => {
    validateConfig(process.env, EnvironmentVariablesValidator);
    return {
        accessKeyId: process.env.STORAGE_ACCESS_ID,
        secretAccessKey: process.env.STORAGE_ACCESS_KEY,
        endpoint: process.env.STORAGE_ENDPOINT,
        bucket: process.env.STORAGE_BUCKET,
    };
});
