import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendInvitationCommand } from '#applications/commands/invitation/send-invitation.command';
import { Inject } from '@nestjs/common';
import { INVITATION_REPOSITORY } from '#shared/constantes/inject-token';
import { InvitationRepository } from '#domain/repository/invitation.repository';
import { Invitation } from '#domain/entities/invitation.entity';

@CommandHandler(SendInvitationCommand)
export class SendInvitationHandler
    implements ICommandHandler<SendInvitationCommand>
{
    constructor(
        @Inject(INVITATION_REPOSITORY)
        private readonly invitationRepository: InvitationRepository
    ) {}

    async execute(command: SendInvitationCommand) {
        const invitation = new Invitation();
        invitation.postId = command.postId;
        invitation.email = command.email;
        invitation.token = crypto.randomUUID();
        invitation.expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return this.invitationRepository.createInvitation(invitation);
    }
}
