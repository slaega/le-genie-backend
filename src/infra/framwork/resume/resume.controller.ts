import { Body, Controller, Delete, Get, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import { ResumeService } from './resume.service';
import { UpsertResumeDto } from './resume.dto';

@Controller('resume')
export class ResumeController {
    constructor(private readonly resumeService: ResumeService) {}

    /** GET /resume/me — CV de l'utilisateur connecté (auth requis) */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMyResume(@Auth() user: AuthUser) {
        return this.resumeService.getMyResume(user.sub);
    }

    /** PUT /resume/me — Créer ou mettre à jour son CV */
    @Put('me')
    @UseGuards(JwtAuthGuard)
    upsertResume(@Auth() user: AuthUser, @Body() dto: UpsertResumeDto) {
        return this.resumeService.upsertResume(user.sub, dto);
    }

    /** DELETE /resume/me — Supprimer son CV */
    @Delete('me')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    deleteResume(@Auth() user: AuthUser) {
        return this.resumeService.deleteResume(user.sub);
    }

    /** GET /resume/:userId — CV public d'un auteur (pas d'auth requis) */
    @Get(':userId')
    getPublicResume(@Param('userId') userId: string) {
        return this.resumeService.getPublicResume(userId);
    }
}
