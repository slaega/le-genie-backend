import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { CommonModule } from '../common/common.module';

@Module({
    imports: [CommonModule],
    controllers: [NotificationController],
})
export class NotificationModule {}
