import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  LifecycleRule,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  S3,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AllConfigType } from '#config/config.type';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
    private readonly logger: LoggerService,
  ) {
    this.s3 = new S3({
      region: 'us-east-1', // Vous pouvez mettre une région fictive, MinIO ne s'en soucie pas
      endpoint: this.configService.getOrThrow('storage.endpoint', {
        infer: true,
      }), // L'endpoint de votre instance MinIO
      credentials: {
        accessKeyId: this.configService.getOrThrow('storage.accessKeyId', {
          infer: true,
        }), // Clé d'accès définie dans MinIO
        secretAccessKey: this.configService.getOrThrow(
          'storage.secretAccessKey',
          {
            infer: true,
          },
        ), // Clé secrète définie dans MinIO
      },
      forcePathStyle: true,
    });
    const bucket = this.configService.getOrThrow('storage.bucket', {
      infer: true,
    });

    this.configureLifecycleRule(bucket, 'temp/', 7)
      .catch((error) => {
        this.logger.error('Error configuring lifecycle rule:', error);
      })
      .finally(() => {
        this.logger.log('Lifecycle rule configuration completed.');
      });
  }

  /**
   * Deletes a file from the S3 bucket.
   *
   * @param {DeleteObjectCommand} input - The command containing the bucket name and file key to delete.
   * @throws {BadRequestException} If the file is not found.
   * @throws {InternalServerErrorException} If an error occurs during deletion.
   */
  async deleteFile(input: DeleteObjectCommand) {
    try {
      await this.s3.send(input);
    } catch (error) {
      const typedError = error as Error; // Assert the error to be of type Error
      if (typedError.name === 'NotFound') {
        throw new BadRequestException('File not found');
      } else {
        throw new InternalServerErrorException(
          'An error occurred while deleting the file.',
          error,
        );
      }
    }
  }

  /**
   * Uploads a file to the S3 bucket.
   *
   * @param {PutObjectCommand} input - The command containing the bucket name, file key, and file data.
   * @throws {BadRequestException} If permissions are insufficient.
   * @throws {InternalServerErrorException} If an error occurs during upload.
   */
  async uploadFile(input: PutObjectCommand) {
    try {
      await this.s3.send(input);
    } catch (error) {
      const typedError = error as Error;
      if (typedError.name === 'Forbidden') {
        throw new BadRequestException(
          'Insufficient permissions to upload file.',
        );
      } else {
        throw new InternalServerErrorException(
          'An error occurred while uploading the file.',
          error,
        );
      }
    }
  }

  /**
   * Generates a presigned URL for accessing a file in the S3 bucket.
   * This URL allows secure and temporary access to the file.
   *
   * @param bucket - The name of the S3 bucket.
   * @param key - The key (file path) of the file in the S3 bucket.
   * @param expiresIn - The expiration time for the URL (in seconds).
   * @returns A promise that resolves to the generated presigned URL.
   * @throws InternalServerErrorException - If an error occurs while generating the presigned URL.
   */
  async generatePresignedUrl(
    bucket: string,
    key: string,
    expiresIn: number,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while generating the presigned URL.',
        error,
      );
    }
  }

  /**
   * Moves a file from one location to another in the S3 bucket.
   *
   * @param {string} Bucket - The name of the S3 bucket.
   * @param {string} sourceKey - The key (file path) of the source file.
   * @param {string} destinationKey - The key (file path) of the destination file.
   * @throws {BadRequestException} If the source file is not found.
   * @throws {InternalServerErrorException} If an error occurs during the move operation.
   */
  async moveFile(
    Bucket: string,
    sourceKey: string,
    destinationKey: string,
  ): Promise<void> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: Bucket,
        Key: sourceKey,
      });
      await this.s3.send(headCommand);
      const copySource = encodeURIComponent(`${Bucket}/${sourceKey}`);
      const copyCommand = new CopyObjectCommand({
        Bucket: Bucket,
        Key: destinationKey,
        ACL: 'private',
        CopySource: copySource,
      });
      await this.s3.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: Bucket,
        Key: sourceKey,
      });
      await this.s3.send(deleteCommand);
    } catch (error) {
      const typedError = error as Error;
      if (typedError.name === 'NoSuchKey') {
        throw new BadRequestException('Source file not found');
      } else {
        throw new InternalServerErrorException(
          'An error occurred while moving the file.',
          error,
        );
      }
    }
  }

  /**
   * Validates if a file in the S3 bucket has expired.
   *
   * @param {string} bucket - The name of the S3 bucket.
   * @param {string} key - The key (file path) of the file in the S3 bucket.
   * @returns {Promise<boolean>} A promise that resolves to true if the file is still valid, false otherwise.
   * @throws {InternalServerErrorException} If an error occurs while validating the file expiration.
   */
  async validateFileExpiration(bucket: string, key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const result = await this.s3.send(command);

      const lastModified = result.LastModified;
      if (!lastModified) {
        throw new InternalServerErrorException(
          'Unable to retrieve file metadata',
        );
      }

      // Vérifier si le fichier est encore valide (moins de 7 jours)
      const now = new Date();
      const ageInDays = Math.floor(
        (now.getTime() - new Date(lastModified).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return ageInDays <= 7; // Retourne `true` si le fichier est encore valide
    } catch (error) {
      this.logger.error(
        'Error validating file expiration:',
        null,
        StorageService.name,
        error,
      );
      throw new InternalServerErrorException(
        'An error occurred while validating file expiration.',
        error,
      );
    }
  }

  /**
   * Moves a file in the S3 bucket after validating its expiration.
   *
   * @param {string} Bucket - The name of the S3 bucket.
   * @param {string} sourceKey - The key (file path) of the source file.
   * @param {string} destinationKey - The key (file path) of the destination file.
   * @throws {BadRequestException} If the file has expired.
   * @throws {InternalServerErrorException} If an error occurs during the move operation.
   */
  async moveFileWithValidation(
    Bucket: string,
    sourceKey: string,
    destinationKey: string,
  ): Promise<void> {
    // Vérifier si le fichier n’a pas expiré
    const isValid = await this.validateFileExpiration(Bucket, sourceKey);
    if (!isValid) {
      throw new BadRequestException(
        'The file has expired and cannot be moved.',
      );
    }

    // Déplacer le fichier s’il est valide
    await this.moveFile(Bucket, sourceKey, destinationKey);
  }

  /**
   * Configure un cycle de vie pour le bucket
   * @param bucketName Nom du bucket
   * @param prefix Préfixe des fichiers concernés
   * @param expirationDays Nombre de jours avant expiration
   */
  async configureLifecycleRule(
    bucketName: string,
    prefix: string,
    expirationDays: number,
  ): Promise<void> {
    const lifecycleRule: LifecycleRule = {
      ID: 'DeleteTempFiles',
      Filter: {
        Prefix: prefix,
      },
      Status: 'Enabled',
      Expiration: {
        Days: expirationDays,
      },
    };

    const command = new PutBucketLifecycleConfigurationCommand({
      Bucket: bucketName,
      LifecycleConfiguration: {
        Rules: [lifecycleRule],
      },
    });

    try {
      await this.s3.send(command);
      this.logger.info(
        `Règle de cycle de vie configurée pour le bucket: ${bucketName}`,
      );
    } catch (error) {
      this.logger.error(
        'Erreur lors de la configuration de la règle de cycle de vie:',
        null,
        StorageService.name,
        error,
      );
      throw new InternalServerErrorException(
        'Impossible de configurer la règle de cycle de vie.',
      );
    }
  }
}
