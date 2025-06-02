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
  async createOne(contributor: Contributor): Promise<Contributor> {
    return this.create({
      data: {
        postId: contributor.postId,
        userId: contributor.userId,
        owner: contributor.owner,
      },
    });
  }
  async findOne(data: Partial<Contributor>): Promise<Contributor | null> {
    return await this.findFirst({
      where: data,
    });
  }
  async findAll(data: Partial<Contributor>): Promise<Contributor[]> {
    return await this.findMany({
      where: data,
    });
  }
  async updateOne(
    id: string,
    data: Partial<Contributor>,
  ): Promise<Contributor> {
    return this.update({
      where: { id },
      data: {
        postId: data.postId,
        userId: data.userId,
        owner: data.owner,
      },
    });
  }
  async removeOne(id: string): Promise<void> {
    await this.delete({
      where: { id },
    });
  }
}
