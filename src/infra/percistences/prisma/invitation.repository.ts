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
  async createOne(invitation: Invitation): Promise<Invitation> {
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
  async updateOne(id: string, data: Partial<Invitation>): Promise<Invitation> {
    return this.update({
      where: { id },
      data,
    });
  }
  async removeOne(id: string): Promise<void> {
    await this.delete({
      where: { id },
    });
  }
  async findOne(data: Partial<Invitation>): Promise<Invitation | null> {
    return await this.findFirst({
      where: data,
    });
  }
  async findAll(data: Partial<Invitation>): Promise<Invitation[]> {
    return await this.findMany({
      where: data,
    });
  }
}
