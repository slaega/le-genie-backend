import { Test } from '@nestjs/testing';
import { SendInvitationHandler } from './send-invitation.handler';
import { SendInvitationCommand } from '#applications/commands/invitation/send-invitation.command';
import { INVITATION_REPOSITORY } from '#shared/constantes/inject-token';
import { InvitationRepository } from '#domain/repository/invitation.repository';
import { Invitation } from '#domain/entities/invitation.entity';

describe('SendInvitationHandler', () => {
    let handler: SendInvitationHandler;
    let invitationRepository: jest.Mocked<
        Pick<InvitationRepository, 'createInvitation'>
    >;

    beforeEach(async () => {
        invitationRepository = { createInvitation: jest.fn() };

        const moduleRef = await Test.createTestingModule({
            providers: [
                SendInvitationHandler,
                {
                    provide: INVITATION_REPOSITORY,
                    useValue: invitationRepository,
                },
            ],
        }).compile();

        handler = moduleRef.get(SendInvitationHandler);
    });

    it('should be defined', () => {
        expect(handler).toBeDefined();
    });

    describe('execute', () => {
        const command = new SendInvitationCommand(
            'post-1',
            'bob@example.com',
            'user-1'
        );

        it('creates an invitation with a UUID token', async () => {
            const saved = new Invitation();
            invitationRepository.createInvitation.mockResolvedValue(saved);

            await handler.execute(command);

            const [invitation] =
                invitationRepository.createInvitation.mock.calls[0];
            expect(typeof invitation.token).toBe('string');
            expect(invitation.token).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
            );
        });

        it('sets expiration 24 hours from now', async () => {
            const before = Date.now();
            invitationRepository.createInvitation.mockResolvedValue(
                new Invitation()
            );

            await handler.execute(command);

            const [invitation] =
                invitationRepository.createInvitation.mock.calls[0];
            const expiresMs = invitation.expiredAt.getTime();
            const expectedMs = before + 24 * 60 * 60 * 1000;

            // Allow 500 ms slack for test execution time
            expect(expiresMs).toBeGreaterThanOrEqual(expectedMs - 500);
            expect(expiresMs).toBeLessThanOrEqual(expectedMs + 500);
        });

        it('passes postId and email from command', async () => {
            invitationRepository.createInvitation.mockResolvedValue(
                new Invitation()
            );

            await handler.execute(command);

            const [invitation] =
                invitationRepository.createInvitation.mock.calls[0];
            expect(invitation.postId).toBe('post-1');
            expect(invitation.email).toBe('bob@example.com');
        });

        it('returns the created invitation', async () => {
            const saved = new Invitation();
            saved.id = 'inv-1';
            invitationRepository.createInvitation.mockResolvedValue(saved);

            const result = await handler.execute(command);
            expect(result).toBe(saved);
        });
    });
});
