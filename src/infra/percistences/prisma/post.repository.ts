import { PrismaRepository } from '#infra/percistences/prisma/prisma-repository';
import { PostRepository } from '#domain/repository/post.repository';
import { Injectable } from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';
import { Post } from '#domain/entities/post.entity';

@Injectable()
export class PostPrismaRepository
  extends PrismaRepository<PrismaClient['post']>
  implements PostRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma.post);
  }
  async createOne(post: Post): Promise<Post> {
    return await this.create({
      data: {
        title: post.title,
        content: JSON.parse(post.content) as Prisma.JsonValue,
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
  async updateOne(id: string, data: Partial<Post>): Promise<Post> {
    return await this.update({
      where: { id },
      data: {
        title: data.title,
        content: JSON.parse(data.content) as Prisma.JsonValue,
        status: data.status,
        postTags: {
          create: data.postTags?.map((tag) => ({
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
  async removeOne(id: string): Promise<void> {
    await this.delete({
      where: { id },
    });
  }
  async findOne(data: Partial<Post>): Promise<Post | null> {
    return await this.findFirst({
      where: {
        title: data.title,
        status: data.status,
      },
      include: {
        contributors: true,
        postTags: true,
      },
    });
  }
  async findAll(data: Partial<Post>): Promise<Post[]> {
    return await this.findMany({
      where: {
        title: data.title,
        status: data.status,
      },
      include: {
        contributors: true,
        postTags: true,
      },
    });
  }
}
