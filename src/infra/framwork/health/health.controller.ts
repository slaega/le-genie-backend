import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service'
import { Public } from '#shared/utils/decorators/public.decorator'

@Controller('healthcheck')
export class HealthController {
    constructor(private readonly prisma: PrismaService) {}

    @Public()
    @Get()
    async check() {
        await this.prisma.$queryRaw`SELECT 1`
        return { status: 'ok', timestamp: new Date().toISOString() }
    }
}
