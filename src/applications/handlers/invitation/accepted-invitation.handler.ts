import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AcceptedInvitationCommand } from "#applications/commands/invitation/accepted-invitation.command";
import { Inject } from "@nestjs/common";
import { CONTRIBUTOR_REPOSITORY, INVITATION_REPOSITORY } from "#shared/constantes/inject-token";
import { InvitationRepository } from "#domain/repository/invitation.repository";
import { ContributorRepository } from "#domain/repository/contributor.repository";
import { Contributor } from "#domain/entities/contributor.entity";



@CommandHandler(AcceptedInvitationCommand)
export class AcceptedInvitationHandler implements ICommandHandler<AcceptedInvitationCommand> {
    constructor(
        @Inject(INVITATION_REPOSITORY) private readonly invitationRepository: InvitationRepository,
        @Inject(CONTRIBUTOR_REPOSITORY) private readonly contributorRepository: ContributorRepository,
    ) {}

    async execute(command: AcceptedInvitationCommand) {
        const invitation = await this.invitationRepository.getInvitationById(command.invitationId);
        if (!invitation) {
            throw new Error('Invitation not found');
        }
        this.contributorRepository.createContributor(new Contributor(invitation.postId, command.authId, false));
        return this.invitationRepository.deleteInvitation(invitation);
    }
}
