import { Injectable } from '@nestjs/common';
import { PrismaProxyRepository } from '#infra/percistences/prisma/prisma';
// import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { CommentRepository } from '#domain/repository/comment.repository';
import { Comment } from '#domain/entities/comment.entity';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CommentPrismaRepository
    extends PrismaProxyRepository<'comment'>()
    implements CommentRepository
{
    constructor(prisma: PrismaClient) {
        super(prisma.comment);
    }
    getCommentsByPostId(postId: string): Promise<Comment[]> {
        return this.findMany({
            where: {
                postId,
            },
        });
    }
    getCommentsById(commentId: string): Promise<Comment | null> {
        return this.findUnique({
            where: {
                id: commentId,
            },
        });
    }
    createComment(comment: Comment): Promise<Comment> {
        return this.create({
            data: comment,
        });
    }
    async removeComment(commentId: string): Promise<void> {
        await this.delete({
            where: {
                id: commentId,
            },
        });
    }
    updateComment(commentId: string, comment: Comment): Promise<Comment> {
        return this.update({
            where: {
                id: commentId,
            },
            data: comment,
        });
    }
}
