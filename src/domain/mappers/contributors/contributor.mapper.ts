import { Contributor } from '#domain/entities/contributor.entity';
import { Contributor as ContributorPrisma } from '@prisma/client';

export class ContributorMapper {
    static toDomain(contributorEntity: ContributorPrisma): Contributor {
        const contributor = new Contributor();
        contributor.id = contributorEntity.id;
        contributor.postId = contributorEntity.postId;
        contributor.userId = contributorEntity.userId;
        contributor.owner = contributorEntity.owner;

        return contributor;
    }

    static toPersistence(contributor: Contributor): Partial<ContributorPrisma> {
        return {
            id: contributor.id,
            postId: contributor.postId,
            userId: contributor.userId,
            owner: contributor.owner,
        };
    }
}
