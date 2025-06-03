import { CONTRIBUTOR_REPOSITORY } from '#shared/constantes/inject-token';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ContributorController } from './contributor.controller';
import { ContributorPrismaRepository } from '#infra/percistences/prisma/contributor.repository';
import { LeaveContributorHandler } from '#applications/handlers/contributor/leave.contribtion.handler';
import { RemoveContributorHandler } from '#applications/handlers/contributor/remove.contribtion.handler';

@Module({
  imports: [CqrsModule, PrismaModule],
  providers: [
    {
      provide: CONTRIBUTOR_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new ContributorPrismaRepository(prisma),
    },
    LeaveContributorHandler,
    RemoveContributorHandler,
  ],
  exports: [CONTRIBUTOR_REPOSITORY],
  controllers: [ContributorController],
})
export class ContributorModule {}
