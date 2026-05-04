import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LikeController } from './like.controller';
import { LikePrismaRepository } from '#infra/persistences/prisma/like.repository';
import { LIKE_REPOSITORY } from '#shared/constantes/inject-token';
import { ToggleLikeHandler } from '#applications/handlers/like/toggle-like.handler';
import { GetLikeStatsQueryHandler } from '#applications/query-handler/like/get-like-stats.query-handler';

@Module({
    imports: [CqrsModule, PrismaModule, AuthModule],
    providers: [
        {
            provide: LIKE_REPOSITORY,
            useFactory: (prisma: PrismaService) =>
                new LikePrismaRepository(prisma),
            inject: [PrismaService],
        },
        ToggleLikeHandler,
        GetLikeStatsQueryHandler,
    ],
    exports: [LIKE_REPOSITORY],
    controllers: [LikeController],
})
export class LikeModule {}
