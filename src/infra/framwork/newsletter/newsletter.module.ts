import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { NewsletterController } from './newsletter.controller';
import { SubscriberPrismaRepository } from '#infra/persistences/prisma/subscriber.repository';
import { SUBSCRIBER_REPOSITORY } from '#shared/constantes/inject-token';

@Module({
    imports: [PrismaModule],
    providers: [
        {
            provide: SUBSCRIBER_REPOSITORY,
            useFactory: (prisma: PrismaService) =>
                new SubscriberPrismaRepository(prisma),
            inject: [PrismaService],
        },
    ],
    controllers: [NewsletterController],
    exports: [SUBSCRIBER_REPOSITORY],
})
export class NewsletterModule {}
