import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelInvitationCommand } from '#applications/commands/invitation/cancel-invitation.command';
import { Inject } from '@nestjs/common';
import { INVITATION_REPOSITORY } from '#shared/constantes/inject-token';
import { InvitationRepository } from '#domain/repository/invitation.repository';

@CommandHandler(CancelInvitationCommand)
export class CancelInvitationHandler
    implements ICommandHandler<CancelInvitationCommand>
{
    constructor(
        @Inject(INVITATION_REPOSITORY)
        private readonly invitationRepository: InvitationRepository
    ) {}

    async execute(command: CancelInvitationCommand) {
        const invitation = await this.invitationRepository.getInvitationById(
            command.invitationId
        );
        if (!invitation) {
            throw new Error('Invitation not found');
        }
        return this.invitationRepository.removeInvitation(invitation.id);
    }
}
