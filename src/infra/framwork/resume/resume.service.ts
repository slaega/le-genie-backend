import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpsertResumeDto } from './resume.dto';

@Injectable()
export class ResumeService {
    constructor(private readonly prisma: PrismaService) {}

    /** Récupère le CV de l'utilisateur connecté (crée un vide si absent) */
    async getMyResume(userId: string) {
        const resume = await this.prisma.resume.findUnique({ where: { userId } });
        if (resume) return resume;

        // Auto-création d'un CV vide au premier accès
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.prisma.resume.create({ data: { userId, data: {} as any } });
    }

    /** Récupère le CV public d'un utilisateur par son ID */
    async getPublicResume(userId: string) {
        const resume = await this.prisma.resume.findUnique({
            where: { userId },
            include: { user: { select: { id: true, name: true, avatarPath: true } } },
        });

        if (!resume || !resume.isPublic) {
            throw new NotFoundException('CV introuvable ou non public.');
        }

        return resume;
    }

    /** Crée ou met à jour le CV de l'utilisateur */
    async upsertResume(userId: string, dto: UpsertResumeDto) {
        const existing = await this.prisma.resume.findUnique({ where: { userId } });

        if (existing) {
            return this.prisma.resume.update({
                where: { userId },
                data: {
                    ...(dto.templateId !== undefined && { templateId: dto.templateId }),
                    ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(dto.data !== undefined && { data: dto.data as any }),
                },
            });
        }

        return this.prisma.resume.create({
            data: {
                userId,
                templateId: dto.templateId ?? 'minimal-light',
                isPublic: dto.isPublic ?? true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: (dto.data ?? {}) as any,
            },
        });
    }

    /** Supprime le CV de l'utilisateur */
    async deleteResume(userId: string) {
        await this.prisma.resume.deleteMany({ where: { userId } });
        return { success: true };
    }
}
