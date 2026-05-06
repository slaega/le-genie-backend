import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { PostPrismaRepository } from '#infra/persistences/prisma/post.repository';
import { PrismaModule } from '../common/prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
    imports: [ScheduleModule.forRoot(), PrismaModule, MailerModule],
    providers: [
        {
            provide: POST_REPOSITORY,
            useClass: PostPrismaRepository,
        },
        SchedulerService,
    ],
})
export class SchedulerModule {}
