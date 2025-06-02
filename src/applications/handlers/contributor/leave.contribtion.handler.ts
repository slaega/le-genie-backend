import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LeaveContributorCommand } from '#applications/commands/contributor/leave.contribution.command';
import { Inject } from '@nestjs/common';
import { CONTRIBUTOR_REPOSITORY } from '#shared/constantes/inject-token';
import { ContributorRepository } from '#domain/repository/contributor.repository';

@CommandHandler(LeaveContributorCommand)
export class LeaveContributorHandler
  implements ICommandHandler<LeaveContributorCommand>
{
  constructor(
    @Inject(CONTRIBUTOR_REPOSITORY)
    private readonly contributorRepository: ContributorRepository,
  ) {}

  async execute(command: LeaveContributorCommand) {
    const contributors = await this.contributorRepository.findAll({
      postId: command.postId,
    });
    if (!contributors) {
      throw new Error('Contributor not found');
    }
    const contributor = contributors.find(
      (contributor) => contributor.userId === command.userId,
    );
    if (!contributor) {
      throw new Error('Contributor not found');
    }
    return this.contributorRepository.removeOne(contributor.id);
  }
}
