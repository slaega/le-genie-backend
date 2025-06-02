import { PrismaRepository } from '#infra/percistences/prisma/prisma-repository';
import { PostRepository } from '#domain/repository/post.repository';
import { Injectable } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { Post } from '#domain/entities/post.entity';

@Injectable()
export class PostPrismaRepository
  extends PrismaRepository<PrismaClient['post']>
  implements PostRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma.post);
  }
  async createPost(post: Post): Promise<Post> {
    return await this.create({
      data: {
        title: post.title,
        content: post.content,
        status: post.status,
        postTags: {
          create: post.postTags.map((tag) => ({
            name: tag.name,
          })),
        },
      },
      include: {
        contributors: true,
        postTags: true,
      },
    });
  }
  async updatePost(post: Post): Promise<Post> {
    return await this.update({
      where: { id: post.id },
      data: {
        title: post.title,
        content: post.content,
        status: post.status,
        postTags: {
          create: post.postTags.map((tag) => ({
            name: tag.name,
          })),
        },
      },
      include: {
        contributors: true,
        postTags: true,
      },
    });
  }
  async deletePost(post: Post): Promise<void> {
    await this.delete({
      where: { id: post.id },
    });
  }
  async getPostById(id: string): Promise<Post | null> {
    return await this.findUnique({
      where: { id },
      include: {
        contributors: true,
        postTags: true,
      },
    });
  }
  async getPostsByUserId(userId: string): Promise<Post[]> {
    return await this.findMany({
      where: { contributors:{ some: { userId } } },
      include: {
        contributors: true,
        postTags: true,
      },
    });
  }
 
}
