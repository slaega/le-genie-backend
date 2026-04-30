import { PostTagsRepository } from '#domain/repository/post-tags.repository';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { PrismaProxyRepository } from './prisma';

export class PostTagsPrismaRepository
    extends PrismaProxyRepository<'postTag'>()
    implements PostTagsRepository
{
    constructor(prisma: PrismaService) {
        super(prisma.postTag);
    }

    async createPostTags(postId: string, name: string): Promise<void> {
        await this.create({
            data: {
                post: {
                    connect: {
                        id: postId,
                    },
                },
                tag: {
                    connectOrCreate: {
                        where: {
                            name: name,
                        },
                        create: {
                            name: name,
                        },
                    },
                },
            },
        });
    }
    async removePostTags(postId: string, name: string): Promise<void> {
        await this.delete({
            where: {
                postId_name: {
                    postId,
                    name,
                },
            },
        });
    }
}
