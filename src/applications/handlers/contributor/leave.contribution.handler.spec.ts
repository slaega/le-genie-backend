import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LeaveContributorHandler } from './leave.contribution.handler';
import { LeaveContributorCommand } from '#applications/commands/contributor/leave.contribution.command';
import { CONTRIBUTOR_REPOSITORY } from '#shared/constantes/inject-token';
import { ContributorRepository } from '#domain/repository/contributor.repository';
import { Contributor } from '#domain/entities/contributor.entity';

function makeContributor(userId: string, owner = false): Contributor {
    const c = new Contributor();
    c.id = `contributor-${userId}`;
    c.postId = 'post-1';
    c.userId = userId;
    c.owner = owner;
    return c;
}

describe('LeaveContributorHandler', () => {
    let handler: LeaveContributorHandler;
    let contributorRepository: jest.Mocked<
        Pick<ContributorRepository, 'getContributorsByPostId' | 'removeContributor'>
    >;

    beforeEach(async () => {
        contributorRepository = {
            getContributorsByPostId: jest.fn(),
            removeContributor: jest.fn(),
        };

        const moduleRef = await Test.createTestingModule({
            providers: [
                LeaveContributorHandler,
                { provide: CONTRIBUTOR_REPOSITORY, useValue: contributorRepository },
            ],
        }).compile();

        handler = moduleRef.get(LeaveContributorHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('removes the matching contributor', async () => {
            const alice = makeContributor('user-alice');
            const bob = makeContributor('user-bob');
            contributorRepository.getContributorsByPostId.mockResolvedValue([alice, bob]);
            contributorRepository.removeContributor.mockResolvedValue(undefined as never);

            const command = new LeaveContributorCommand('post-1', 'user-alice');
            await handler.execute(command);

            expect(contributorRepository.removeContributor).toHaveBeenCalledWith('contributor-user-alice');
        });

        it('throws NotFoundException when post has no contributors', async () => {
            contributorRepository.getContributorsByPostId.mockResolvedValue(null as never);

            const command = new LeaveContributorCommand('post-1', 'user-alice');
            await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
            expect(contributorRepository.removeContributor).not.toHaveBeenCalled();
        });

        it('throws ForbiddenException when user is not a contributor', async () => {
            const bob = makeContributor('user-bob');
            contributorRepository.getContributorsByPostId.mockResolvedValue([bob]);

            const command = new LeaveContributorCommand('post-1', 'user-alice');
            await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
            expect(contributorRepository.removeContributor).not.toHaveBeenCalled();
        });
    });
});
