import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, type Prisma } from '@prisma/client';

type Provider = 'postgres' | 'mysql' | 'sqlite';

/** Returns Prisma constructor options for the configured DATABASE_PROVIDER. */
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

    if (provider === 'sqlite') {
        // Prisma 7 requires a driver adapter even for SQLite
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const {
            PrismaBetterSqlite3,
        } = require('@prisma/adapter-better-sqlite3');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Database = require('better-sqlite3');
        const url = (process.env.DATABASE_URL ?? 'file:./dev.db').replace(
            /^file:/,
            ''
        );
        const db = new Database(url);
        return { adapter: new PrismaBetterSqlite3(db), log: ['error', 'warn'] };
    }

    // mysql — native Prisma query engine (no driver adapter in this setup)
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
