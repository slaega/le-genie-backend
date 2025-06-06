import { Contributor } from '#domain/entities/contributor.entity';
import { ContributorResponseDto } from '#dto/contributor/contributor-response.dto';
import { Contributor as ContributorPrisma, User } from '@prisma/client';
import { UserMapper } from '../user/user.mapper';

export class ContributorMapper {
    static toDomain(
        contributorEntity: ContributorPrisma & { user: User }
    ): Contributor {
        const contributor = new Contributor();
        contributor.id = contributorEntity.id;
        contributor.postId = contributorEntity.postId;
        contributor.userId = contributorEntity.userId;
        contributor.owner = contributorEntity.owner;
        contributor.createdAt = contributorEntity.createdAt;
        contributor.updatedAt = contributorEntity.updatedAt;
        contributor.user = UserMapper.toDomain(contributorEntity.user);

        return contributor;
    }

    static toDto(contributorEntity: Contributor): ContributorResponseDto {
        const contributor = new ContributorResponseDto();
        contributor.id = contributorEntity.id;
        contributor.postId = contributorEntity.postId;
        contributor.userId = contributorEntity.userId;
        contributor.owner = contributorEntity.owner;
        contributor.user = UserMapper.toDto(contributorEntity.user);

        return contributor;
    }

    static toPersistence(contributor: Contributor): ContributorPrisma {
        return {
            id: contributor.id,
            postId: contributor.postId,
            userId: contributor.userId,
            owner: contributor.owner,
            createdAt: contributor.createdAt,
            updatedAt: contributor.updatedAt,
        };
    }
}
