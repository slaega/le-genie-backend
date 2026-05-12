import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, type Prisma } from '@prisma/client';

type Provider = 'postgres' | 'mysql' | 'sqlite';

/** Builds Prisma constructor options based on DATABASE_PROVIDER. */
function buildOptions(): Prisma.PrismaClientOptions {
    const provider = (process.env.DATABASE_PROVIDER ?? 'postgres') as Provider;

    if (provider === 'postgres') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaPg } = require('@prisma/adapter-pg');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Pool } = require('pg');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        return { adapter: new PrismaPg(pool), log: ['error', 'warn'] };
    }

    // sqlite / mysql — native Prisma query engine, no driver adapter needed
    return { log: ['error', 'warn'] };
}

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor() {
        super(buildOptions());
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}
