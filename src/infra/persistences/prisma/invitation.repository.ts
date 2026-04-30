import { Injectable } from '@nestjs/common';

import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { InvitationRepository } from '#domain/repository/invitation.repository';
import { Invitation } from '#domain/entities/invitation.entity';

@Injectable()
export class InvitationPrismaRepository implements InvitationRepository {
    constructor(private readonly prisma: PrismaService) {}
    async getInvitationByPostId(postId: string): Promise<Invitation[]> {
        return this.prisma.invitation.findMany({
            where: {
                postId,
            },
        });
    }
    async getInvitationById(invitationId: string): Promise<Invitation | null> {
        return this.prisma.invitation.findUnique({
            where: {
                id: invitationId,
            },
        });
    }
    async createInvitation(invitation: Invitation): Promise<Invitation> {
        return this.prisma.invitation.create({
            data: invitation,
        });
    }
    async updateInvitation(
        invitationId: string,
        invitation: Invitation
    ): Promise<Invitation> {
        return this.prisma.invitation.update({
            where: {
                id: invitationId,
            },
            data: invitation,
        });
    }
    async removeInvitation(invitationId: string): Promise<void> {
        await this.prisma.invitation.delete({
            where: {
                id: invitationId,
            },
        });
    }
}
