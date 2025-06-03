import { PostTag } from '#domain/entities/post-tag.entity';
import { PostTag as PostTagPrisma } from '@prisma/client';

export class PostTagMapper {
  static toDomain(postTagEntity: PostTagPrisma): PostTag {
    const postTag = new PostTag();
    postTag.postId = postTagEntity.postId;
    postTag.name = postTagEntity.name;

    return postTag;
  }

  static toPersistence(postTag: PostTag): Partial<PostTagPrisma> {
    return {
      postId: postTag.postId,
      name: postTag.name,
    };
  }
}
