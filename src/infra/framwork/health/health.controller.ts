import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { Public } from '#shared/utils/decorators/public.decorator';

// VERSION_NEUTRAL : le healthcheck est accessible sans préfixe de version
// (/healthcheck, pas /v1.0/healthcheck) — indispensable pour le docker healthcheck.
@Controller({ path: 'healthcheck', version: VERSION_NEUTRAL })
export class HealthController {
    constructor(private readonly prisma: PrismaService) {}

    @Public()
    @Get()
    async check() {
        await this.prisma.$queryRaw`SELECT 1`;
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
