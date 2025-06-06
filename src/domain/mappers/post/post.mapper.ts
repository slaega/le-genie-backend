import { Post } from '#domain/entities/post.entity';
import { ContributorMapper } from '#domain/mappers/contributors/contributor.mapper';
import { PostResponseDto } from '#dto/post/post-response.dto';
import { Prisma } from '@prisma/client';
import { PostTagMapper } from '../post-tags/post-tag.mapper';

type PostPrisma = Prisma.PostGetPayload<{
    include: {
        contributors: {
            include: {
                user: true;
            };
        };
        postTags: true;
    };
}>;
export class PostMapper {
    static toDomain(postEntity: PostPrisma): Post {
        const post = new Post();
        post.id = postEntity.id;
        post.title = postEntity.title;
        post.content = JSON.stringify(postEntity.content);
        post.status = postEntity.status;
        post.imagePath = postEntity.imagePath;
        post.createdAt = postEntity.createdAt;
        post.updatedAt = postEntity.updatedAt;
        post.contributors = postEntity.contributors.map((contributor) =>
            ContributorMapper.toDomain(contributor)
        );
        post.postTags = postEntity.postTags.map((postTag) =>
            PostTagMapper.toDomain(postTag)
        );

        return post;
    }

    static toDto(postEntity: Post): PostResponseDto {
        const post = new PostResponseDto();
        post.id = postEntity.id;
        post.title = postEntity.title;
        post.imagePath = postEntity.imagePath;
        post.content = postEntity.content;
        post.status = postEntity.status;
        post.createdAt = postEntity.createdAt;
        post.updatedAt = postEntity.updatedAt;
        post.contributors = postEntity.contributors.map((contributor) =>
            ContributorMapper.toDto(contributor)
        );
        post.postTags = postEntity.postTags.map((postTag) =>
            PostTagMapper.toDomain(postTag)
        );
        return post;
    }

    static toPersistence(post: Post): Partial<PostPrisma> {
        return {
            id: post.id,
            title: post.title,
            content: post.content,
            status: post.status,
            imagePath: post.imagePath,
        };
    }
}
