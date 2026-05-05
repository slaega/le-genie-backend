import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '#infra/framwork/common/prisma/prisma.module';
import { CmsController } from './cms.controller';

@Module({
    imports: [CqrsModule, PrismaModule],
    controllers: [CmsController],
})
export class CmsModule {}
