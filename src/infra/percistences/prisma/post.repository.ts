import { PostRepository } from '#domain/repository/post.repository';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { Post } from '#domain/entities/post.entity';
import { PostMapper } from '#domain/mappers/post/post.mapper';
import { PrismaProxyRepository } from './prisma';
import { PostStatus } from '#shared/enums/post-status.enum';
import { Prisma } from '@prisma/client';

const INCLUDE = {
    contributors: {
        include: {
            user: true,
        },
    },
    postTags: true,
};
@Injectable()
export class PostPrismaRepository
    extends PrismaProxyRepository<'post'>()
    implements PostRepository
{
    constructor(prisma: PrismaService) {
        super(prisma.post);
    }
    async getPosts(
        page: number,
        limit: number,
        filter: { tags?: string[] },
        sort: string
    ): Promise<{ items: Post[]; total: number; page: number; limit: number }> {
        const where: Prisma.PostWhereInput = {
            // status: PostStatus.PUBLISHED,
        };
        const orderBy: Prisma.PostOrderByWithRelationInput =
            sort === 'popular' ? { updatedAt: 'desc' } : { createdAt: 'desc' };
        if (filter.tags?.length) {
            where['postTags'] = {
                some: {
                    tag: {
                        name: { in: filter.tags },
                    },
                },
            };
        }
        const [postEntity, total] = await Promise.all([
            this.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where,
                orderBy,
                include: INCLUDE,
            }),
            this.count({ where }),
        ]);
        const items = postEntity.map((postEntity) =>
            PostMapper.toDomain(postEntity)
        );
        return {
            items,
            total,
            page,
            limit,
        };
    }
    async getPostByIdAndStatus(
        postId: string,
        status: PostStatus | 'ALL'
    ): Promise<Post | null> {
        const where: Prisma.PostWhereInput = {
            id: postId,
        };
        if (status !== 'ALL') {
            where.status = status;
        }
        const postEntity = await this.findFirst({
            where,
            include: INCLUDE,
        });
        return postEntity ? PostMapper.toDomain(postEntity) : null;
    }
    async getPostById(postId: string): Promise<Post | null> {
        const postEntity = await this.findUnique({
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
        const createdPost = await this.create({
            data: {
                title: post.title,
                content: post.content,
                status: post.status,
                contributors: {
                    create: post.contributors.map((contributor) => ({
                        userId: contributor.userId,
                        owner: contributor.owner,
                    })),
                },
            },
            include: INCLUDE,
        });
        return PostMapper.toDomain(createdPost);
    }
    async updatePost(postId: string, post: Post): Promise<Post> {
        const updatedPost = await this.update({
            where: {
                id: postId,
            },
            data: {
                title: post.title,
                content: JSON.parse(post.content),
                status: post.status,
            },
            include: INCLUDE,
        });
        return PostMapper.toDomain(updatedPost);
    }
    async removePost(postId: string): Promise<void> {
        await this.delete({
            where: {
                id: postId,
            },
        });
    }
}
