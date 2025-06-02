import { PrismaRepository } from '#infra/percistences/prisma/prisma-repository';
import { Injectable } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { ContributorRepository } from '#domain/repository/contributor.repository';
import { Contributor } from '#domain/entities/contributor.entity';

@Injectable()
export class ContributorPrismaRepository
  extends PrismaRepository<PrismaClient['contributor']>
  implements ContributorRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma.contributor);
  }
  async createContributor(contributor: Contributor): Promise<Contributor> {
    return this.create({
      data: {
        postId: contributor.postId,
        userId: contributor.userId,
        owner: contributor.owner,
      },
    });
  }
  async getContributorById(id: string): Promise<Contributor | null> {
    return this.findUnique({
      where: { id },
    });
  }
  async getContributorsByPostId(postId: string): Promise<Contributor[]> {
    return this.findMany({
      where: { postId },
    });
  }
  async updateContributor(contributor: Contributor): Promise<Contributor> {
    return this.update({
      where: { id: contributor.id },
      data: {
        postId: contributor.postId,
        userId: contributor.userId,
        owner: contributor.owner,
      },
    });
  }
  async deleteContributor(contributor: Contributor): Promise<void> {
    await this.delete({
      where: { id: contributor.id },
    });
  }
 
}
