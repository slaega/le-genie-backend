import { PrismaRepository } from '#infra/percistences/prisma/prisma-repository';
import { Injectable } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { InvitationRepository } from '#domain/repository/invitation.repository';
import { Invitation } from '#domain/entities/invitation.entity';

@Injectable()
export class InvitationPrismaRepository
  extends PrismaRepository<PrismaClient['invitation']>
  implements InvitationRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma.invitation);
  }
  async createInvitation(invitation: Invitation): Promise<Invitation> {
    return await this.create({
      data: {
        postId: invitation.postId,
        email: invitation.email,
        token: invitation.token,
        content: invitation.content,
        expiredAt: invitation.expiredAt,
      },
    });
  }
  async updateInvitation(invitation: Invitation): Promise<Invitation> {
    return this.update({
      where: { id: invitation.id },
      data: {
        postId: invitation.postId,
        email: invitation.email,
        token: invitation.token,
        expiredAt: invitation.expiredAt,
      },
    });
  }
  async deleteInvitation(invitation: Invitation): Promise<Invitation> {
    return await this.delete({
      where: { id: invitation.id },
    });
  }
  async getInvitationById(id: string): Promise<Invitation | null> {
    return await this.findUnique({
      where: { id },
    });
  }
  async getInvitationsByPostId(postId: string): Promise<Invitation[]> {
    return await this.findMany({
      where: { postId },
    });
  }
 
}
