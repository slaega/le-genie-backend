import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CONTRIBUTOR_REPOSITORY } from '#shared/constantes/inject-token';
import { ContributorRepository } from '#domain/repository/contributor.repository';
import { RemoveContributorCommand } from '#applications/commands/contributor/remove.contributor.command';

@CommandHandler(RemoveContributorCommand)
export class RemoveContributorHandler
    implements ICommandHandler<RemoveContributorCommand>
{
    constructor(
        @Inject(CONTRIBUTOR_REPOSITORY)
        private readonly contributorRepository: ContributorRepository
    ) {}

    async execute(command: RemoveContributorCommand) {
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
        const isCurrentContributor = contributors.find(
            (contributor) => contributor.userId === command.currentUserId
        );
        if (!contributor) {
            throw new ForbiddenException({
                message: 'Forbidden your not authorized',
            });
        }
        if (!isCurrentContributor || isCurrentContributor.owner) {
            throw new ForbiddenException({
                message: 'Forbidden your not authorized',
            });
        }
        await this.contributorRepository.removeContributor(contributor.id);
    }
}
