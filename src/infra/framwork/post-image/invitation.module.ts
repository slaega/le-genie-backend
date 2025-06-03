import { INVITATION_REPOSITORY, STORAGE_PROVIDER } from '#shared/constantes/inject-token';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PostImagesController } from './post-images.controller';
import { PostModule } from '../post/post.module';
import { StorageService } from '#infra/framwork/common/storage/storage.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger/logger.service';
import { RemoveContributorHandler } from '#applications/handlers/contributor/remove.contribtion.handler';
import { UploadImageHandler } from '#applications/handlers/post-images/upload-image.handler';

@Module({
  imports: [CqrsModule, PrismaModule, PostModule],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: (config: ConfigService,logger:LoggerService) =>
        new StorageService(config,logger),
      inject:[ConfigService,LoggerService]
    },
    RemoveContributorHandler,
    UploadImageHandler,
  ],
  exports: [INVITATION_REPOSITORY],
  controllers: [PostImagesController],
})
export class PostImageModule {}
