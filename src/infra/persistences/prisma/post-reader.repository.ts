import { Injectable } from '@nestjs/common';
import { PrismaProxyRepository } from '#infra/persistences/prisma/prisma';
import { PostReaderRepository } from '#domain/repository/post-reader.repository';
import { PostReader } from '#domain/entities/post-reader.entity';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PostReaderPrismaRepository
    extends PrismaProxyRepository<'postReader'>()
    implements PostReaderRepository
{
    constructor(prisma: PrismaClient) {
        super(prisma.postReader);
    }

    /**
     * Uses the (postId, readerId) unique constraint to upsert idempotently.
     * Returns true if it's the first view for this reader.
     */
    async track(reader: PostReader): Promise<boolean> {
        const existing = await this.findUnique({
            where: {
                postId_readerId: {
                    postId: reader.postId,
                    readerId: reader.readerId,
                },
            },
        });
        if (existing) return false;

        await this.create({
            data: {
                postId: reader.postId,
                readerId: reader.readerId,
                ip: reader.ip,
                userAgent: reader.userAgent,
                userId: reader.userId,
            },
        });
        return true;
    }

    countByPost(postId: string): Promise<number> {
        return this.count({ where: { postId } });
    }
}
