import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor() {
        // Prisma 7 : l'URL n'est plus dans le schéma, elle doit être
        // passée explicitement au client via datasourceUrl
        super({
            log: ['error', 'warn'],
            datasourceUrl: process.env.DATABASE_URL,
        });
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}
