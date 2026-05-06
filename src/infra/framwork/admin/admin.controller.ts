import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { PaginationQuery, UpdateUserDto } from './admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    // ─── Stats ────────────────────────────────────────────────────────────────

    @Get('stats')
    async stats() {
        return this.adminService.getStats();
    }

    // ─── Users ────────────────────────────────────────────────────────────────

    @Get('users')
    async listUsers(@Query() q: PaginationQuery & { search?: string }) {
        return this.adminService.listUsers(q);
    }

    @Patch('users/:id')
    async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.adminService.updateUser(id, dto);
    }

    // ─── Posts ────────────────────────────────────────────────────────────────

    @Get('posts')
    async listPosts(
        @Query() q: PaginationQuery & { status?: string; search?: string }
    ) {
        return this.adminService.listPosts(q);
    }

    @Patch('posts/:id/archive')
    async archivePost(@Param('id') id: string) {
        return this.adminService.archivePost(id);
    }

    @Delete('posts/:id')
    async deletePost(@Param('id') id: string) {
        return this.adminService.deletePost(id);
    }

    // ─── Subscribers ──────────────────────────────────────────────────────────

    @Get('subscribers')
    async listSubscribers(@Query() q: PaginationQuery) {
        return this.adminService.listSubscribers(q);
    }

    @Delete('subscribers/:id')
    async deleteSubscriber(@Param('id') id: string) {
        return this.adminService.deleteSubscriber(id);
    }
}
