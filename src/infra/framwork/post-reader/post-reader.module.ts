import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PostReaderController } from './post-reader.controller';
import { PostReaderPrismaRepository } from '#infra/persistences/prisma/post-reader.repository';
import { POST_READER_REPOSITORY } from '#shared/constantes/inject-token';
import { TrackViewHandler } from '#applications/handlers/post-reader/track-view.handler';
import { GetViewCountQueryHandler } from '#applications/query-handler/post-reader/get-view-count.query-handler';

@Module({
    imports: [CqrsModule, PrismaModule, AuthModule],
    providers: [
        {
            provide: POST_READER_REPOSITORY,
            useFactory: (prisma: PrismaService) =>
                new PostReaderPrismaRepository(prisma),
            inject: [PrismaService],
        },
        TrackViewHandler,
        GetViewCountQueryHandler,
    ],
    exports: [POST_READER_REPOSITORY],
    controllers: [PostReaderController],
})
export class PostReaderModule {}
