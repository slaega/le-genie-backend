import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { FollowController } from './follow.controller';
import { FollowPrismaRepository } from '#infra/persistences/prisma/follow.repository';
import { FOLLOW_REPOSITORY } from '#shared/constantes/inject-token';

@Module({
    imports: [CqrsModule, PrismaModule, AuthModule],
    providers: [
        {
            provide: FOLLOW_REPOSITORY,
            useFactory: (prisma: PrismaService) =>
                new FollowPrismaRepository(prisma),
            inject: [PrismaService],
        },
    ],
    exports: [FOLLOW_REPOSITORY],
    controllers: [FollowController],
})
export class FollowModule {}
