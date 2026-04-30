import { registerAs } from '@nestjs/config'
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator'
import type { StorageConfig, StorageDriver } from './storage-config.type'
import validateConfig from '#shared/utils/validate-config'

class StorageEnvValidator {
    @IsEnum(['local', 's3', 'minio', 'r2'])
    @IsOptional()
    STORAGE_DRIVER: StorageDriver

    @IsString()
    @IsOptional()
    STORAGE_ACCESS_ID: string

    @IsString()
    @IsOptional()
    STORAGE_ACCESS_KEY: string

    @IsUrl({ require_tld: false })
    @IsOptional()
    STORAGE_ENDPOINT: string

    @IsString()
    @IsOptional()
    STORAGE_BUCKET: string

    @IsString()
    @IsOptional()
    STORAGE_REGION: string

    @IsUrl({ require_tld: false })
    @IsOptional()
    STORAGE_PUBLIC_URL: string

    @IsString()
    @IsOptional()
    STORAGE_UPLOAD_DIR: string
}

export default registerAs<StorageConfig>('storage', () => {
    validateConfig(process.env, StorageEnvValidator)
    const driver = (process.env.STORAGE_DRIVER ?? 'local') as StorageDriver
    return {
        driver,
        accessKeyId: process.env.STORAGE_ACCESS_ID,
        secretAccessKey: process.env.STORAGE_ACCESS_KEY,
        endpoint: process.env.STORAGE_ENDPOINT,
        bucket: process.env.STORAGE_BUCKET,
        region: process.env.STORAGE_REGION ?? 'auto',
        publicUrl: process.env.STORAGE_PUBLIC_URL,
        forcePathStyle: driver === 'minio' || driver === 'r2',
        uploadDir: process.env.STORAGE_UPLOAD_DIR ?? './uploads',
        localPublicUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3030',
    }
})
