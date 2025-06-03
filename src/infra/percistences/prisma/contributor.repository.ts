import { Injectable } from '@nestjs/common';
import { ContributorRepository } from '#domain/repository/contributor.repository';
import { Contributor } from '#domain/entities/contributor.entity';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';

@Injectable()
export class ContributorPrismaRepository implements ContributorRepository {
    constructor(private readonly prisma: PrismaService) {}
    async getContributorsByPostId(postId: string): Promise<Contributor[]> {
        return this.prisma.contributor.findMany({
            where: {
                postId,
            },
        });
    }
    async createContributor(contributor: Contributor): Promise<Contributor> {
        return this.prisma.contributor.create({
            data: contributor,
        });
    }
    async removeContributor(contributorId: string): Promise<void> {
        await this.prisma.contributor.delete({
            where: {
                id: contributorId,
            },
        });
    }
}
