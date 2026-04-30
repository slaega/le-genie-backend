import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CmsController } from './cms.controller';

@Module({
    imports: [CqrsModule],
    controllers: [CmsController],
})
export class CmsModule {}
