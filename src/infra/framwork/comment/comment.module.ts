import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CommentController } from './comment.controller';
import { CommentPrismaRepository } from '#infra/percistences/prisma/comment.repository';
import { COMMENT_REPOSITORY } from '#shared/constantes/inject-token';
import { MakeCommentHandler } from '#applications/handlers/comment/make-comment.handler';
import { RefactorCommentHandler } from '#applications/handlers/comment/refactor-comment.handler';
import { RemoveCommentHandler } from '#applications/handlers/comment/remove-comment.handler';

@Module({
    imports: [CqrsModule, PrismaModule],
    providers: [
        {
            provide: COMMENT_REPOSITORY,
            useFactory: (prisma: PrismaService) =>
                new CommentPrismaRepository(prisma),
            inject: [PrismaService],
        },
        MakeCommentHandler,
        RefactorCommentHandler,
        RemoveCommentHandler,
    ],
    exports: [COMMENT_REPOSITORY],
    controllers: [CommentController],
})
export class CommentModule {}
