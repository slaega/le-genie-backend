import { Injectable } from '@nestjs/common';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { SubscriberRepository } from '#domain/repository/subscriber.repository';

@Injectable()
export class SubscriberPrismaRepository implements SubscriberRepository {
    constructor(private readonly prisma: PrismaService) {}

    async subscribe(email: string): Promise<void> {
        await this.prisma.subscriber.upsert({
            where: { email },
            create: { email },
            update: {},
        });
    }

    async unsubscribe(email: string): Promise<void> {
        await this.prisma.subscriber.deleteMany({ where: { email } });
    }

    async findAll(): Promise<string[]> {
        const rows = await this.prisma.subscriber.findMany({
            select: { email: true },
        });
        return rows.map((r) => r.email);
    }

    async exists(email: string): Promise<boolean> {
        return !!(await this.prisma.subscriber.findUnique({
            where: { email },
        }));
    }
}
