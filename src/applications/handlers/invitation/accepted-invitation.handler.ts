import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AcceptedInvitationCommand } from '#applications/commands/invitation/accepted-invitation.command';
import { Inject } from '@nestjs/common';
import {
  CONTRIBUTOR_REPOSITORY,
  INVITATION_REPOSITORY,
} from '#shared/constantes/inject-token';
import { InvitationRepository } from '#domain/repository/invitation.repository';
import { ContributorRepository } from '#domain/repository/contributor.repository';
import { Contributor } from '#domain/entities/contributor.entity';

@CommandHandler(AcceptedInvitationCommand)
export class AcceptedInvitationHandler
  implements ICommandHandler<AcceptedInvitationCommand>
{
  constructor(
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepository: InvitationRepository,
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository,
  ) {}

  async execute(command: AcceptedInvitationCommand) {
    const invitation = await this.invitationRepository.getInvitationById(
      command.invitationId,
    );
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    const contributor = new Contributor();
    contributor.postId = invitation.postId;
    contributor.userId = command.authId;
    contributor.owner = false;
    await this.contributorRepository.createContributor(contributor);
    return this.invitationRepository.removeInvitation(invitation.id);
  }
}
