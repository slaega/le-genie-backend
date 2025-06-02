import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LeaveContributorCommand } from '#applications/commands/contributor/leave.contribution.command';
import { Inject } from '@nestjs/common';
import { CONTRIBUTOR_REPOSITORY } from '#shared/constantes/inject-token';
import { ContributorRepository } from '#domain/repository/contributor.repository';
import { RemoveContributorCommand } from '#applications/commands/contributor/remove.contributor.command';

@CommandHandler(LeaveContributorCommand)
export class LeaveContributorHandler
  implements ICommandHandler<LeaveContributorCommand>
{
  constructor(
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository,
  ) {}

  async execute(command: RemoveContributorCommand) {
    const contributors =
      await this.contributorRepository.getContributorsByPostId(command.postId);
    if (!contributors) {
      throw new Error('Contributor not found');
    }
    const contributor = contributors.find(
      (contributor) => contributor.userId === command.userId,
    );
    if (!contributor) {
      throw new Error('Contributor not found');
    }
    if (contributor.owner && command.currentUserId !== contributor.userId) {
      throw new Error('You are not the owner of this post');
    }
    await this.contributorRepository.removeContributor(contributor.id);
  }
}
