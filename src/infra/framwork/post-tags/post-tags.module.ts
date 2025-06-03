import { POST_TAGS_REPOSITORY } from '#shared/constantes/inject-token';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PostTagsController } from './post-tags.controller';
import { PostModule } from '../post/post.module';
import { RemoveContributorHandler } from '#applications/handlers/contributor/remove.contribtion.handler';
import { UploadImageHandler } from '#applications/handlers/post-images/upload-image.handler';
import { PrismaService } from '../common/prisma/prisma.service';
import { PostTagsPrismaRepository } from '#infra/percistences/prisma/post-tags.repository';

@Module({
    imports: [CqrsModule, PrismaModule, PostModule],
    providers: [
        {
            provide: POST_TAGS_REPOSITORY,
            useFactory: (prisma: PrismaService) =>
                new PostTagsPrismaRepository(prisma),
            inject: [PrismaService],
        },
        RemoveContributorHandler,
        UploadImageHandler,
    ],
    exports: [POST_TAGS_REPOSITORY],
    controllers: [PostTagsController],
})
export class PostTagsModule {}
