import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from '#shared/constantes/inject-token';
import type { StorageConfig } from '#config/storage/storage-config.type';
import type { AllConfigType } from '#config/config.type';
import { S3CompatibleProvider } from './providers/s3-compatible.provider';
import { LocalStorageProvider } from './providers/local.provider';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: STORAGE_PROVIDER,
            useFactory: (config: ConfigService<AllConfigType>) => {
                const storageConfig = config.getOrThrow<StorageConfig>(
                    'storage',
                    {
                        infer: true,
                    }
                );
                switch (storageConfig.driver) {
                    case 's3':
                    case 'minio':
                    case 'r2':
                        return new S3CompatibleProvider(storageConfig);
                    case 'local':
                    default:
                        return new LocalStorageProvider(storageConfig);
                }
            },
            inject: [ConfigService],
        },
    ],
    exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
