import {
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import { PrismaService } from '../common/prisma/prisma.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly prisma: PrismaService) {}

    /** GET /notifications — dernières 30 notifs de l'utilisateur connecté */
    @Get()
    async list(@Auth() user: AuthUser) {
        const items = await this.prisma.notification.findMany({
            where: { userId: user.sub },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        const unreadCount = items.filter((n) => !n.read).length;
        return { items, unreadCount };
    }

    /** PATCH /notifications/read-all — marque toutes comme lues */
    @Patch('read-all')
    async markAllRead(@Auth() user: AuthUser) {
        await this.prisma.notification.updateMany({
            where: { userId: user.sub, read: false },
            data: { read: true },
        });
        return { success: true };
    }

    /** PATCH /notifications/:id/read — marque une notif comme lue */
    @Patch(':id/read')
    async markRead(@Auth() user: AuthUser, @Param('id') id: string) {
        await this.prisma.notification.updateMany({
            where: { id, userId: user.sub },
            data: { read: true },
        });
        return { success: true };
    }

    /** DELETE /notifications — supprime toutes les notifs de l'utilisateur */
    @Delete()
    async removeAll(@Auth() user: AuthUser) {
        await this.prisma.notification.deleteMany({ where: { userId: user.sub } });
        return { success: true };
    }

    /** DELETE /notifications/:id — supprime une notif */
    @Delete(':id')
    async remove(@Auth() user: AuthUser, @Param('id') id: string) {
        await this.prisma.notification.deleteMany({
            where: { id, userId: user.sub },
        });
        return { success: true };
    }
}
