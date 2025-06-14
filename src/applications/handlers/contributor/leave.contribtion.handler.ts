import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LeaveContributorCommand } from '#applications/commands/contributor/leave.contribution.command';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CONTRIBUTOR_REPOSITORY } from '#shared/constantes/inject-token';
import { ContributorRepository } from '#domain/repository/contributor.repository';

@CommandHandler(LeaveContributorCommand)
export class LeaveContributorHandler
    implements ICommandHandler<LeaveContributorCommand>
{
    constructor(
        @Inject(CONTRIBUTOR_REPOSITORY)
        private readonly contributorRepository: ContributorRepository
    ) {}

    async execute(command: LeaveContributorCommand) {
        const contributors =
            await this.contributorRepository.getContributorsByPostId(
                command.postId
            );
        if (!contributors) {
            throw new NotFoundException({
                message: 'Contributor not found',
            });
        }
        const contributor = contributors.find(
            (contributor) => contributor.userId === command.userId
        );
        if (!contributor) {
            throw new ForbiddenException({
                message: 'Forbidden your not authorized',
            });
        }
        await this.contributorRepository.removeContributor(contributor.id);
    }
}
