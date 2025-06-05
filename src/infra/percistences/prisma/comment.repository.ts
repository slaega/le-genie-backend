import { Injectable } from '@nestjs/common';
import { PrismaProxyRepository } from '#infra/percistences/prisma/prisma';
import { CommentRepository } from '#domain/repository/comment.repository';
import { Comment } from '#domain/entities/comment.entity';
import { PrismaClient } from '@prisma/client';
import { Pagination } from '#shared/Pagination';

@Injectable()
export class CommentPrismaRepository
    extends PrismaProxyRepository<'comment'>()
    implements CommentRepository
{
    constructor(prisma: PrismaClient) {
        super(prisma.comment);
    }
    async getCommentsByPostId(
        postId: string,
        page: number,
        limit: number
    ): Promise<Pagination<Comment>> {
        const [comments, total] = await Promise.all([
            this.findMany({
                where: {
                    postId,
                },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: true,
                },
            }),
            this.count({ where: { postId } }),
        ]);
        return {
            items: comments,
            total,
            page,
            limit,
        };
    }
    getCommentsById(commentId: string): Promise<Comment | null> {
        return this.findUnique({
            where: {
                id: commentId,
            },
            include: {
                user: true,
            },
        });
    }
    createComment(comment: Comment): Promise<Comment> {
        return this.create({
            data: {
                content: comment.content,
                postId: comment.postId,
                userId: comment.userId,
                refactorAt: comment.refactorAt,
            },
            include: {
                user: true,
            },
        });
    }
    async removeComment(commentId: string): Promise<void> {
        await this.delete({
            where: {
                id: commentId,
            },
            include: {
                user: true,
            },
        });
    }
    updateComment(commentId: string, comment: Comment): Promise<Comment> {
        return this.update({
            where: {
                id: commentId,
            },
            data: {
                content: comment.content,
                refactorAt: new Date(),
            },
            include: {
                user: true,
            },
        });
    }
}
