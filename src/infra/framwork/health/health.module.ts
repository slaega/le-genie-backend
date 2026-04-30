import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { PrismaModule } from '#infra/framwork/common/prisma/prisma.module'

@Module({
    imports: [PrismaModule],
    controllers: [HealthController],
})
export class HealthModule {}
