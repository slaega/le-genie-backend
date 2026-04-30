import { Test } from '@nestjs/testing';
import { AcceptedInvitationHandler } from './accepted-invitation.handler';
import { AcceptedInvitationCommand } from '#applications/commands/invitation/accepted-invitation.command';
import {
    CONTRIBUTOR_REPOSITORY,
    INVITATION_REPOSITORY,
} from '#shared/constantes/inject-token';
import { InvitationRepository } from '#domain/repository/invitation.repository';
import { ContributorRepository } from '#domain/repository/contributor.repository';
import { Invitation } from '#domain/entities/invitation.entity';

function makeInvitation(id: string, postId: string): Invitation {
    const inv = new Invitation();
    inv.id = id;
    inv.postId = postId;
    inv.email = 'bob@example.com';
    inv.token = crypto.randomUUID();
    inv.expiredAt = new Date(Date.now() + 3600_000);
    return inv;
}

describe('AcceptedInvitationHandler', () => {
    let handler: AcceptedInvitationHandler;
    let invitationRepository: jest.Mocked<
        Pick<InvitationRepository, 'getInvitationById' | 'removeInvitation'>
    >;
    let contributorRepository: jest.Mocked<
        Pick<ContributorRepository, 'createContributor'>
    >;

    beforeEach(async () => {
        invitationRepository = {
            getInvitationById: jest.fn(),
            removeInvitation: jest.fn(),
        };
        contributorRepository = { createContributor: jest.fn() };

        const moduleRef = await Test.createTestingModule({
            providers: [
                AcceptedInvitationHandler,
                { provide: INVITATION_REPOSITORY, useValue: invitationRepository },
                { provide: CONTRIBUTOR_REPOSITORY, useValue: contributorRepository },
            ],
        }).compile();

        handler = moduleRef.get(AcceptedInvitationHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        it('creates a non-owner contributor from the invitation', async () => {
            const inv = makeInvitation('inv-1', 'post-1');
            invitationRepository.getInvitationById.mockResolvedValue(inv);
            contributorRepository.createContributor.mockResolvedValue(undefined as never);
            invitationRepository.removeInvitation.mockResolvedValue(undefined as never);

            const command = new AcceptedInvitationCommand('inv-1', 'user-bob');
            await handler.execute(command);

            const [contributor] = contributorRepository.createContributor.mock.calls[0];
            expect(contributor.postId).toBe('post-1');
            expect(contributor.userId).toBe('user-bob');
            expect(contributor.owner).toBe(false);
        });

        it('removes the invitation after accepting', async () => {
            const inv = makeInvitation('inv-1', 'post-1');
            invitationRepository.getInvitationById.mockResolvedValue(inv);
            contributorRepository.createContributor.mockResolvedValue(undefined as never);
            invitationRepository.removeInvitation.mockResolvedValue(undefined as never);

            const command = new AcceptedInvitationCommand('inv-1', 'user-bob');
            await handler.execute(command);

            expect(invitationRepository.removeInvitation).toHaveBeenCalledWith('inv-1');
        });

        it('throws when invitation does not exist', async () => {
            invitationRepository.getInvitationById.mockResolvedValue(null as never);

            const command = new AcceptedInvitationCommand('missing', 'user-bob');
            await expect(handler.execute(command)).rejects.toThrow('Invitation not found');
            expect(contributorRepository.createContributor).not.toHaveBeenCalled();
        });
    });
});
