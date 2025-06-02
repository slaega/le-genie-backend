import { Invitation } from '#domain/entities/invitation.entity';

export interface InvitationRepository {
  getInvitationByPostId(postId: string): Promise<Invitation[]>;
  getInvitationById(invitationId: string): Promise<Invitation | null>;
  createInvitation(invitation: Invitation): Promise<Invitation>;
  updateInvitation(
    invitationId: string,
    invitation: Invitation,
  ): Promise<Invitation>;
  removeInvitation(invitationId: string): Promise<void>;
}
