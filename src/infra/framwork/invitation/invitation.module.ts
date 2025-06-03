import { INVITATION_REPOSITORY } from '#shared/constantes/inject-token';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '../common/prisma/prisma.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { InvitationController } from './invitation.controller';
import { InvitationPrismaRepository } from '#infra/percistences/prisma/invitation.repository';
import { ContributorModule } from '../contributor/contributor.module';
import { AcceptedInvitationHandler } from '#applications/handlers/invitation/accepted-invitation.handler';
import { RefusedInvitationHandler } from '#applications/handlers/invitation/refused-invitation.handler';
import { CancelInvitationHandler } from '#applications/handlers/invitation/cancel-invitation.handler';
import { SendInvitationHandler } from '#applications/handlers/invitation/send-invitation.handler';

@Module({
  imports: [CqrsModule, PrismaModule, ContributorModule],
  providers: [
    {
      provide: INVITATION_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new InvitationPrismaRepository(prisma),
    },
    AcceptedInvitationHandler,
    RefusedInvitationHandler,
    CancelInvitationHandler,
    SendInvitationHandler,
  ],
  exports: [INVITATION_REPOSITORY],
  controllers: [InvitationController],
})
export class InvitationModule {}
