import { PostPrismaRepository } from '#infra/percistences/prisma/post.repository';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { DeletePostHandler } from '#applications/handlers/post/delete-post.handler';
import { UpdatePostHandler } from '#applications/handlers/post/update-post.handler';
import { CreateEmptyPostHandler } from '#applications/handlers/post/create-empty-post.handler';
import { PostController } from './post.controller';
import { ContributorModule } from '../contributor/contributor.module';
import { GetPostQueryHandler } from '#applications/query-handler/post/get-post.query-handler';
import { GetPostsQueryHandler } from '#applications/query-handler/post/get-posts.query-handler';
import { StorageModule } from '../common/storage/storage.module';

@Module({
    imports: [CqrsModule, PrismaModule, ContributorModule, StorageModule],
    providers: [
        {
            provide: POST_REPOSITORY,
            useFactory: (prisma: PrismaService) =>
                new PostPrismaRepository(prisma),
            inject: [PrismaService],
        },
        CreateEmptyPostHandler,
        DeletePostHandler,
        UpdatePostHandler,
        GetPostQueryHandler,
        GetPostsQueryHandler,
    ],
    exports: [],
    controllers: [PostController],
})
export class PostModule {}
