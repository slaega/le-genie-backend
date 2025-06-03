import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3,
} from '@aws-sdk/client-s3';
import { AllConfigType } from '#config/config.type';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from '#domain/services/storage.provider';
import { LoggerService } from '../logger/logger.service';
@Injectable()
export class StorageService implements StorageProvider {
    private s3: S3;
    /**
     * Constructor for initializing the storage service.
     *
     * @param {ConfigService<AllConfigType>} configService - The configuration service used to fetch storage settings.
     * @param {LoggerService} logger - The logger service used for logging information, warnings, and errors.
     * @return {void} This constructor does not return a value.
     */
    constructor(
        private readonly configService: ConfigService<AllConfigType>,
        private readonly logger: LoggerService
    ) {
        this.s3 = new S3({
            region: 'us-east-1', // Vous pouvez mettre une région fictive, MinIO ne s'en soucie pas
            endpoint: this.configService.getOrThrow('storage.endpoint', {
                infer: true,
            }), // L'endpoint de votre instance MinIO
            credentials: {
                accessKeyId: this.configService.getOrThrow(
                    'storage.accessKeyId',
                    {
                        infer: true,
                    }
                ), // Clé d'accès définie dans MinIO
                secretAccessKey: this.configService.getOrThrow(
                    'storage.secretAccessKey',
                    {
                        infer: true,
                    }
                ), // Clé secrète définie dans MinIO
            },
            forcePathStyle: true,
        });
    }

    async upload({
        path,
        file,
        contentType,
    }: {
        path: string;
        file: Buffer;
        contentType?: string;
    }): Promise<string> {
        const bucket = this.configService.getOrThrow('storage.bucket', {
            infer: true,
        });
        this.logger.info(`Uploading file to S3: ${path}`);
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: path,
            Body: file,
            ContentType: contentType ?? 'application/octet-stream',
        });

        await this.s3.send(command);
        return path;
    }

    async download(path: string): Promise<Buffer> {
        const bucket = this.configService.getOrThrow('storage.bucket', {
            infer: true,
        });

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: path,
        });

        try {
            const response = await this.s3.send(command);
            const stream = response.Body as NodeJS.ReadableStream;

            const chunks: Buffer[] = [];
            for await (const chunk of stream) {
                chunks.push(
                    typeof chunk === 'string' ? Buffer.from(chunk) : chunk
                );
            }

            return Buffer.concat(chunks);
        } catch (error) {
            throw new InternalServerErrorException(
                'Erreur lors du téléchargement du fichier',
                error
            );
        }
    }

    async delete(path: string): Promise<void> {
        const bucket = this.configService.getOrThrow('storage.bucket', {
            infer: true,
        });

        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: path,
        });

        await this.s3.send(command);
    }

    async getPublicUrl(path: string): Promise<string> {
        const bucket = this.configService.getOrThrow('storage.bucket', {
            infer: true,
        });
        const endpoint = this.configService.getOrThrow('storage.endpoint', {
            infer: true,
        });

        // Remove any trailing slash from the endpoint
        const cleanEndpoint = endpoint.replace(/\/$/, '');
        return Promise.resolve(`${cleanEndpoint}/${bucket}/${path}`);
    }
}
