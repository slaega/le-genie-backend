import { Invitation } from "#domain/entities/invitation.entity";

export interface InvitationRepository {
    createInvitation(invitation: Invitation): Promise<Invitation>;
    updateInvitation(invitation: Invitation): Promise<Invitation>;
    deleteInvitation(invitation: Invitation): Promise<Invitation>;
    getInvitationById(id: string): Promise<Invitation | null>;
    getInvitationsByPostId(postId: string): Promise<Invitation[]>;
}