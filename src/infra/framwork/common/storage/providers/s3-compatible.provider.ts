import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3,
} from '@aws-sdk/client-s3';
import type { StorageConfig } from '#config/storage/storage-config.type';
import type { StorageProvider } from '#domain/services/storage.provider';
import { InternalServerErrorException, Logger } from '@nestjs/common';

/**
 * S3-compatible storage — works with AWS S3, Cloudflare R2, and MinIO.
 *
 * Driver selection:
 *  - s3    : standard AWS (forcePathStyle = false, region matters)
 *  - r2    : Cloudflare R2 (forcePathStyle = true, endpoint = <account>.r2.cloudflarestorage.com)
 *  - minio : self-hosted MinIO (forcePathStyle = true, custom endpoint)
 */
export class S3CompatibleProvider implements StorageProvider {
    private readonly s3: S3;
    private readonly logger = new Logger(S3CompatibleProvider.name);

    constructor(private readonly config: StorageConfig) {
        this.s3 = new S3({
            region: config.region ?? 'auto',
            endpoint: config.endpoint,
            credentials:
                config.accessKeyId && config.secretAccessKey
                    ? {
                          accessKeyId: config.accessKeyId,
                          secretAccessKey: config.secretAccessKey,
                      }
                    : undefined,
            forcePathStyle: config.forcePathStyle ?? false,
        });
    }

    async upload({
        path,
        file,
        contentType,
    }: {
        path: string;
        file: Buffer | Blob;
        contentType?: string;
    }): Promise<string> {
        const buf = Buffer.isBuffer(file)
            ? file
            : Buffer.from(await (file as Blob).arrayBuffer());

        this.logger.log(`Uploading ${path} to ${this.config.driver}`);
        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.config.bucket,
                Key: path,
                Body: buf,
                ContentType: contentType ?? 'application/octet-stream',
            })
        );
        return path;
    }

    async download(path: string): Promise<Buffer> {
        const res = await this.s3.send(
            new GetObjectCommand({ Bucket: this.config.bucket, Key: path })
        );
        const stream = res.Body as NodeJS.ReadableStream;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }

    async delete(path: string): Promise<void> {
        await this.s3
            .send(
                new DeleteObjectCommand({
                    Bucket: this.config.bucket,
                    Key: path,
                })
            )
            .catch((err) => {
                this.logger.warn(`Failed to delete ${path}: ${err.message}`);
                throw new InternalServerErrorException('Storage delete failed');
            });
    }

    async getPublicUrl(path: string): Promise<string> {
        if (this.config.publicUrl) {
            return `${this.config.publicUrl.replace(/\/$/, '')}/${path}`;
        }
        const endpoint = (this.config.endpoint ?? '').replace(/\/$/, '');
        return `${endpoint}/${this.config.bucket}/${path}`;
    }
}
