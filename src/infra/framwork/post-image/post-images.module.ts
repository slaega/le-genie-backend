import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PostImagesController } from './post-images.controller';
import { PostModule } from '../post/post.module';
import { UploadImageHandler } from '#applications/handlers/post-images/upload-image.handler';
import { StorageModule } from '../common/storage/storage.module';
import { RemoveImageHandler } from '#applications/handlers/post-images/remove-image.handler';

@Module({
    imports: [CqrsModule, PostModule, StorageModule],
    providers: [RemoveImageHandler, UploadImageHandler],
    controllers: [PostImagesController],
})
export class PostImageModule {}
