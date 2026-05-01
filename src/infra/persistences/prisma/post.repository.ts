import { PostRepository } from '#domain/repository/post.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { Post } from '#domain/entities/post.entity';
import { PostMapper } from '#domain/mappers/post/post.mapper';
import { PrismaProxyRepository } from './prisma';
import { PostStatus } from '#shared/enums/post-status.enum';
import { Prisma } from '@prisma/client';
import { paginate, type Pagination } from '#shared/Pagination';

const INCLUDE = {
    contributors: { include: { user: true } },
    postTags: true,
} as const;

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
        filter: { tags?: string[]; status?: PostStatus },
        sort: string,
        authId?: string
    ): Promise<Pagination<Post>> {
        const where: Prisma.PostWhereInput = {};
        const orderBy: Prisma.PostOrderByWithRelationInput =
            sort === 'popular'
                ? { postReaders: { _count: 'desc' } }
                : { createdAt: 'desc' };

        if (filter.status) {
            where.status = filter.status;
        } else if (!authId) {
            // Public access — only show published posts
            where.status = PostStatus.PUBLISHED;
        }

        if (filter.tags?.length) {
            where.postTags = { some: { tag: { name: { in: filter.tags } } } };
        }

        if (authId) {
            where.contributors = { some: { userId: authId } };
        }

        const [rows, total] = await Promise.all([
            this.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where,
                orderBy,
                include: INCLUDE,
            }),
            this.count({ where }),
        ]);

        return paginate(rows.map(PostMapper.toDomain), total, page, limit);
    }

    async getPostByIdAndStatus(
        postId: string,
        status: PostStatus | 'ALL'
    ): Promise<Post | null> {
        const where: Prisma.PostWhereInput = { id: postId };
        if (status !== 'ALL') where.status = status;
        const raw = await this.findFirst({ where, include: INCLUDE });
        return raw ? PostMapper.toDomain(raw) : null;
    }

    async getPostById(postId: string): Promise<Post | null> {
        const raw = await this.findUnique({
            where: { id: postId },
            include: INCLUDE,
        });
        return raw ? PostMapper.toDomain(raw) : null;
    }

    async createPost(post: Post): Promise<Post> {
        const created = await this.create({
            data: {
                title: post.title,
                content: post.content ?? '{}',
                status: post.status,
                contributors: {
                    create: post.contributors.map((c) => ({
                        userId: c.userId,
                        owner: c.owner,
                    })),
                },
            },
            include: INCLUDE,
        });
        return PostMapper.toDomain(created);
    }

    async updatePost(postId: string, post: Post): Promise<Post> {
        const updated = await this.update({
            where: { id: postId },
            data: {
                title: post.title,
                content: post.content,
                status: post.status,
                imagePath: post.imagePath,
            },
            include: INCLUDE,
        });
        return PostMapper.toDomain(updated);
    }

    async removePost(postId: string): Promise<void> {
        await this.delete({ where: { id: postId } });
    }
}
