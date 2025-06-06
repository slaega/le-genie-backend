import { Contributor } from '#domain/entities/contributor.entity';
import { ContributorMapper } from '#domain/mappers/contributors/contributor.mapper';
import { ContributorRepository } from '#domain/repository/contributor.repository';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ContributorPrismaRepository implements ContributorRepository {
    constructor(private readonly prisma: PrismaService) {}
    async getContributorsByPostId(postId: string): Promise<Contributor[]> {
        return this.prisma.contributor.findMany({
            where: {
                postId,
            },
            include: {
                user: true,
            },
        });
    }
    async createContributor(contributor: Contributor): Promise<Contributor> {
        const createdContributor = await this.prisma.contributor.create({
            data: ContributorMapper.toPersistence(contributor),
            include: {
                user: true,
            },
        });
        return ContributorMapper.toDomain(createdContributor);
    }
    async removeContributor(contributorId: string): Promise<void> {
        await this.prisma.contributor.delete({
            where: {
                id: contributorId,
            },
        });
    }
}
