import { PostRepository } from '#domain/repository/post.repository';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { Post } from '#domain/entities/post.entity';
import { PostMapper } from '#domain/mappers/post/post.mapper';
const INCLUDE = {
  contributors: {
    include: {
      user: true,
    },
  },
  postTags: true,
};
@Injectable()
export class PostPrismaRepository implements PostRepository {
  constructor(private readonly prisma: PrismaService) {}
  async getPostById(postId: string): Promise<Post | null> {
    const postEntity = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: INCLUDE,
    });
    if (!postEntity) {
      return null;
    }

    return PostMapper.toDomain(postEntity);
  }
  async createPost(post: Post): Promise<Post> {
    const createdPost = await this.prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        status: post.status,
      },
      include: INCLUDE,
    });
    return PostMapper.toDomain(createdPost);
  }
  async updatePost(postId: string, post: Post): Promise<Post> {
    const updatedPost = await this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title: post.title,
        content: post.content,
        status: post.status,
      },
      include: INCLUDE,
    });
    return PostMapper.toDomain(updatedPost);
  }
  async removePost(postId: string): Promise<void> {
    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
  }
}
